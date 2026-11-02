import { Router } from 'express';
import {
  login,
  refresh,
  logout,
  getMe,
  changePassword,
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, changePasswordSchema } from '../schemas/auth.schema.js';
import { requireAuth, csrfProtection } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.post('/change-password', requireAuth, csrfProtection, validate(changePasswordSchema), changePassword);

export default router;
