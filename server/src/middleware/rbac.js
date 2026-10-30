import { sendError } from '../utils/response.js';

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
