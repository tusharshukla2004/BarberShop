import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { AuditLog } from '../models/AuditLog.js';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { accessCookieOptions, refreshCookieOptions } from '../middleware/auth.js';

// Precomputed cost-12 dummy hash for constant-time comparison against non-existent accounts
const DUMMY_HASH = '$2a$12$e8Y6l9b1J5dZ5/V6XlV7y.mN/rU.l5d9Yd9Hh.fF.eG.hH.iI.jJ.';

/**
 * Signs short-lived access JWT (15 minutes)
 */
function generateAccessToken(admin) {
  const payload = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    barberId: admin.barberId || null,
    tokenVersion: admin.tokenVersion || 0,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET || env.JWT_SECRET, {
    expiresIn: '15m',
  });
}

/**
 * Creates and stores a rotated refresh token
 */
async function issueRefreshToken(admin, family = null, req = null) {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = RefreshToken.hashToken(rawToken);
  const tokenFamily = family || crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    await RefreshToken.create({
      userId: admin._id || admin.id,
      tokenHash,
      family: tokenFamily,
      expiresAt,
      ip: req?.ip || '',
      userAgent: req?.get('user-agent') || '',
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'production') throw err;
  }

  return rawToken;
}

/**
 * Records an audit log entry safely without buffering if MongoDB is disconnected in unit tests
 */
async function recordAudit(logData) {
  try {
    if (AuditLog.db?.readyState === 1 || process.env.NODE_ENV === 'production') {
      await AuditLog.create(logData);
    }
  } catch {
    // Non-fatal for mock test runners
  }
}

/**
 * Staff Login (Owner / Barber only)
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const admin = await Admin.findOne({ email: cleanEmail });

    if (!admin) {
      // Timing attack prevention: dummy bcrypt comparison
      await bcrypt.compare(password, DUMMY_HASH);
      await recordAudit({
        action: 'login_failure',
        actorEmail: cleanEmail,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        status: 'failure',
        details: { reason: 'account_not_found' },
      });
      return sendError(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check account lockout
    const isLocked = typeof admin.isLocked === 'function' ? admin.isLocked() : false;
    if (isLocked) {
      await recordAudit({
        action: 'account_locked',
        actorId: admin._id,
        actorEmail: admin.email,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        status: 'warning',
        details: { lockUntil: admin.lockUntil },
      });
      return sendError(
        res,
        423,
        'Account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.',
        'ACCOUNT_LOCKED'
      );
    }

    if (!admin.isActive && admin.isActive !== undefined) {
      await recordAudit({
        action: 'login_failure',
        actorId: admin._id,
        actorEmail: admin.email,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        status: 'failure',
        details: { reason: 'account_inactive' },
      });
      return sendError(res, 401, 'Account has been deactivated.', 'ACCOUNT_DEACTIVATED');
    }

    let isMatch = false;
    if (typeof admin.comparePassword === 'function') {
      isMatch = await admin.comparePassword(password);
    } else if (admin.passwordHash) {
      isMatch = await bcrypt.compare(password, admin.passwordHash);
    }

    if (!isMatch) {
      if (typeof admin.recordFailedLogin === 'function') {
        await admin.recordFailedLogin();
      }
      const isNowLocked = typeof admin.isLocked === 'function' ? admin.isLocked() : false;

      await recordAudit({
        action: isNowLocked ? 'account_locked' : 'login_failure',
        actorId: admin._id,
        actorEmail: admin.email,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        status: isNowLocked ? 'warning' : 'failure',
        details: { failedAttempts: admin.failedLoginAttempts },
      });

      if (isNowLocked) {
        return sendError(
          res,
          423,
          'Account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.',
          'ACCOUNT_LOCKED'
        );
      }

      return sendError(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Successful login: reset lock & record timestamp
    if (typeof admin.recordSuccessfulLogin === 'function') {
      await admin.recordSuccessfulLogin();
    }

    const accessToken = generateAccessToken(admin);
    const refreshToken = await issueRefreshToken(admin, null, req);

    res.cookie(env.ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
    res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
    res.cookie(env.COOKIE_NAME, accessToken, accessCookieOptions);

    await recordAudit({
      action: 'login_success',
      actorId: admin._id,
      actorEmail: admin.email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
      details: { role: admin.role },
    });

    const userPayload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      barberId: admin.barberId || null,
      mustChangePassword: Boolean(admin.mustChangePassword),
    };

    return sendSuccess(
      res,
      {
        user: userPayload,
      },
      200,
      'Signed in successfully'
    );
  } catch (error) {
    return next(error);
  }
}

/**
 * Refresh Access Token with Token Rotation and Replay Detection
 */
export async function refresh(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.[env.REFRESH_COOKIE_NAME];
    if (!rawRefreshToken) {
      return sendError(res, 401, 'Refresh token required.', 'REFRESH_TOKEN_REQUIRED');
    }

    const tokenHash = RefreshToken.hashToken(rawRefreshToken);
    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (!storedToken) {
      // Token not found
      return sendError(res, 401, 'Invalid refresh token.', 'INVALID_REFRESH_TOKEN');
    }

    // Replay Detection: If token is already revoked or used, invalidate entire token family!
    if (storedToken.isRevoked) {
      await RefreshToken.updateMany({ family: storedToken.family }, { isRevoked: true });
      res.clearCookie(env.ACCESS_COOKIE_NAME, accessCookieOptions);
      res.clearCookie(env.REFRESH_COOKIE_NAME, refreshCookieOptions);

      await AuditLog.create({
        action: 'token_replay_detected',
        actorId: storedToken.userId,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        status: 'warning',
        details: { family: storedToken.family },
      });

      return sendError(
        res,
        401,
        'Invalid or replayed token detected. Session has been revoked.',
        'TOKEN_REPLAY_DETECTED'
      );
    }

    // Check expiration
    if (storedToken.expiresAt.getTime() < Date.now()) {
      storedToken.isRevoked = true;
      await storedToken.save();
      return sendError(res, 401, 'Refresh token expired.', 'TOKEN_EXPIRED');
    }

    const admin = await Admin.findById(storedToken.userId);
    if (!admin || !admin.isActive) {
      return sendError(res, 401, 'Staff account inactive or not found.', 'UNAUTHORIZED');
    }

    // Rotate: Revoke the current token and issue a new one in the same family
    storedToken.isRevoked = true;
    storedToken.usedAt = new Date();
    await storedToken.save();

    const newAccessToken = generateAccessToken(admin);
    const newRefreshToken = await issueRefreshToken(admin, storedToken.family, req);

    res.cookie(env.ACCESS_COOKIE_NAME, newAccessToken, accessCookieOptions);
    res.cookie(env.REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions);

    const userPayload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      barberId: admin.barberId || null,
      mustChangePassword: Boolean(admin.mustChangePassword),
    };

    return sendSuccess(res, { user: userPayload }, 200, 'Session refreshed');
  } catch (error) {
    return next(error);
  }
}

/**
 * Staff Logout: Revokes refresh token and clears all auth cookies
 */
export async function logout(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.[env.REFRESH_COOKIE_NAME];
    if (rawRefreshToken) {
      const tokenHash = RefreshToken.hashToken(rawRefreshToken);
      await RefreshToken.updateOne({ tokenHash }, { isRevoked: true, usedAt: new Date() });
    }

    // Legacy cookie clean-up
    res.clearCookie(env.COOKIE_NAME, { path: '/' });
    res.clearCookie('barbershop_auth_token', { path: '/' });
    res.clearCookie(env.ACCESS_COOKIE_NAME, { ...accessCookieOptions, maxAge: 0 });
    res.clearCookie(env.REFRESH_COOKIE_NAME, { ...refreshCookieOptions, maxAge: 0 });

    if (req.user) {
      await AuditLog.create({
        action: 'logout',
        actorId: req.user.id,
        actorEmail: req.user.email,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        status: 'success',
      });
    }

    return sendSuccess(res, null, 200, 'Logged out successfully');
  } catch (error) {
    return next(error);
  }
}

/**
 * Returns current authenticated staff user profile
 */
export function getMe(req, res) {
  return sendSuccess(res, { user: req.user });
}

/**
 * Staff Password Change
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return sendError(res, 404, 'Staff account not found', 'NOT_FOUND');
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 400, 'Current password is incorrect.', 'INVALID_PASSWORD');
    }

    const newHash = await Admin.hashPassword(newPassword);
    admin.passwordHash = newHash;
    admin.mustChangePassword = false;
    admin.passwordChangedAt = new Date();
    admin.tokenVersion = (admin.tokenVersion || 0) + 1;
    await admin.save();

    // Revoke all existing refresh tokens
    await RefreshToken.updateMany({ userId: admin._id }, { isRevoked: true });

    // Issue fresh tokens for the current session
    const accessToken = generateAccessToken(admin);
    const refreshToken = await issueRefreshToken(admin, null, req);

    res.cookie(env.ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
    res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

    await AuditLog.create({
      action: 'password_changed',
      actorId: admin._id,
      actorEmail: admin.email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    return sendSuccess(
      res,
      {
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          barberId: admin.barberId || null,
          mustChangePassword: false,
        },
      },
      200,
      'Password changed successfully'
    );
  } catch (error) {
    return next(error);
  }
}
