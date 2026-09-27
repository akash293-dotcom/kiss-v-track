import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import * as controller from '../controllers/attendance.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.post('/', requireRole([UserRole.TRAINER, UserRole.CENTRE_ADMIN]), controller.markBulk);
router.get('/summary', controller.getSummary);

export default router;
