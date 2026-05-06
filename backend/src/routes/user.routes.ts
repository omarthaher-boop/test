import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';
import { getMe, updateMe, deleteMe } from '../controllers/user.controller';

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  licensePlate: z.string().min(2).max(12).optional(),
});

const router = Router();

router.use(authenticate);
router.get('/me', getMe);
router.patch('/me', validate(updateUserSchema), updateMe);
router.delete('/me', deleteMe);

export default router;
