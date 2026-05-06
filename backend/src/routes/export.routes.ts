import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { exportQuerySchema, emailExportSchema } from '../schemas/trip.schema';
import { exportPdf, exportCsv, exportEmail } from '../controllers/export.controller';

const router = Router();

router.use(authenticate);
router.get('/pdf', validate(exportQuerySchema, 'query'), exportPdf);
router.get('/csv', validate(exportQuerySchema, 'query'), exportCsv);
router.post('/email', validate(emailExportSchema), exportEmail);

export default router;
