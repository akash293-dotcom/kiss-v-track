import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import * as controller from '../controllers/report.controller';

const router = Router();
router.use(authenticate);

router.get('/trainee/:id', requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN, UserRole.TRAINER]), controller.getTraineeReport);
router.get('/batch/:id', requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN, UserRole.TRAINER]), controller.getBatchReport);
router.get('/institutional', requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN]), controller.getInstitutionalReport);

export default router;
