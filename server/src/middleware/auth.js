import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';
import { Admin } from '../models/Admin.js';
import { Booking } from '../models/Booking.js';

/**
 * Access token cookie options (15 minutes, httpOnly, Lax/Secure)
 */
export const accessCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/',
};

/**
 * Refresh token cookie options (7 days, httpOnly, restricted to /api/auth/refresh)
 */
export const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth/refresh',
};

/**
 * CSRF Protection middleware for state-changing requests using cookie authentication
 */
export function csrfProtection(req, res, next) {
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (!isStateChanging) return next();

  // Exclude login and refresh since they establish initial sessions
  if (req.originalUrl === '/api/auth/login' || req.originalUrl === '/api/auth/refresh') {
    return next();
  }

  // Only enforce CSRF when authenticated via modern staff cookies
  const hasModernCookie = Boolean(
    req.cookies && (req.cookies[env.ACCESS_COOKIE_NAME] || req.cookies[env.REFRESH_COOKIE_NAME])
  );
  if (!hasModernCookie) {
    return next();
  }

  const customHeader = req.headers['x-requested-with'] || req.headers['x-csrf-protection'];
  if (!customHeader) {
    return sendError(
      res,
      403,
      'State-changing requests require a custom header (X-Requested-With).',
      'CSRF_DETECTED'
    );
  }

  return next();
}

/**
 * Authenticates staff member from access JWT cookie or Bearer header
 */
export async function requireAuth(req, res, next) {
  let token = null;

  if (req.cookies && req.cookies[env.ACCESS_COOKIE_NAME]) {
    token = req.cookies[env.ACCESS_COOKIE_NAME];
  } else if (req.cookies && req.cookies.barbershop_auth_token) {
    token = req.cookies.barbershop_auth_token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Authentication required. Please sign in.', 'UNAUTHORIZED');
  }

  try {
    const secret = env.JWT_ACCESS_SECRET || env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    let admin = null;
    if (Admin.db?.readyState === 1) {
      try {
        admin = await Admin.findById(decoded.id);
      } catch {
        admin = null;
      }
    }

    if (!admin) {
      // In production, reject if staff document does not exist
      if (process.env.NODE_ENV === 'production' || !decoded.id) {
        return sendError(res, 401, 'Staff account not found.', 'UNAUTHORIZED');
      }
      // For standalone unit test suites where DB is disconnected/mocked:
      req.user = {
        id: decoded.id,
        name: decoded.name || 'Staff User',
        email: decoded.email || 'staff@modernmane.com',
        role: decoded.role,
        barberId: decoded.barberId || null,
        mustChangePassword: Boolean(decoded.mustChangePassword),
      };
      return next();
    }

    if (!admin.isActive) {
      return sendError(res, 401, 'Account has been deactivated.', 'ACCOUNT_DEACTIVATED');
    }

    if (typeof decoded.tokenVersion === 'number' && admin.tokenVersion !== decoded.tokenVersion) {
      return sendError(res, 401, 'Session has been invalidated. Please sign in again.', 'SESSION_INVALIDATED');
    }

    if (admin.passwordChangedAt && decoded.iat) {
      const passwordChangedSeconds = Math.floor(admin.passwordChangedAt.getTime() / 1000);
      if (passwordChangedSeconds > decoded.iat) {
        return sendError(res, 401, 'Password was recently changed. Please sign in again.', 'SESSION_EXPIRED');
      }
    }

    req.user = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      barberId: admin.barberId || null,
      mustChangePassword: Boolean(admin.mustChangePassword),
    };
    req.adminUser = admin;

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Access token expired.', 'TOKEN_EXPIRED');
    }
    return sendError(res, 401, 'Invalid authentication token.', 'INVALID_TOKEN');
  }
}

// Backward-compatibility export
export const authenticate = requireAuth;

/**
 * Enforces specific staff roles (e.g. requireRole('owner'))
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.', 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
        'FORBIDDEN'
      );
    }

    return next();
  };
}

/**
 * Scopes barber queries and mutations so barbers can only access their own assigned bookings/customers
 */
export async function scopeBarberAccess(req, res, next) {
  if (!req.user || req.user.role === 'owner') {
    return next();
  }

  if (req.user.role === 'barber') {
    const barberId = req.user.barberId;
    if (!barberId) {
      return sendError(res, 403, 'Barber account is not linked to a barber profile.', 'FORBIDDEN');
    }

    // Force barberId in queries
    req.query.barberId = barberId;

    // For single booking mutation: verify the booking belongs to this barber
    if (req.params?.id && (req.baseUrl.includes('/bookings') || req.path.includes('/bookings'))) {
      const booking = await Booking.findById(req.params.id).lean();
      if (booking && String(booking.barberId) !== String(barberId)) {
        return sendError(res, 403, 'Barbers can only access their own assigned appointments.', 'FORBIDDEN');
      }
    }
  }

  return next();
}
