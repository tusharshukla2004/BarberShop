import { Router } from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
