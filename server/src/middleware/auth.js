import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';

export function authenticate(req, res, next) {
  let token = null;

  // 1. Check httpOnly cookie
  if (req.cookies && req.cookies[env.COOKIE_NAME]) {
    token = req.cookies[env.COOKIE_NAME];
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    // 2. Fallback to Authorization Header
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Authentication required. Please sign in.', 'UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Session expired. Please sign in again.', 'TOKEN_EXPIRED');
    }
    return sendError(res, 401, 'Invalid authentication token.', 'INVALID_TOKEN');
  }
}
