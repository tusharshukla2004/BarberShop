import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return sendError(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const payload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const isProduction = env.NODE_ENV === 'production';

    res.cookie(env.COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return sendSuccess(
      res,
      {
        user: payload,
        token,
      },
      200,
      'Signed in successfully'
    );
  } catch (error) {
    return next(error);
  }
}

export function logout(req, res) {
  const isProduction = env.NODE_ENV === 'production';
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  });

  return sendSuccess(res, null, 200, 'Logged out successfully');
}

export function getMe(req, res) {
  return sendSuccess(res, { user: req.user });
}
