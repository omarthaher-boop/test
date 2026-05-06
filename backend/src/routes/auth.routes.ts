import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  register, login, refresh, logout, verifyEmail, resendVerification,
} from '../controllers/auth.controller';
import {
  registerSchema, loginSchema, refreshSchema, logoutSchema, resendVerificationSchema,
} from '../schemas/auth.schema';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', authenticate, validate(logoutSchema), logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authLimiter, validate(resendVerificationSchema), resendVerification);

export default router;
