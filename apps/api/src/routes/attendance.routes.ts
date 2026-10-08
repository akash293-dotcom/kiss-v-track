import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import * as controller from '../controllers/attendance.controller';

const router = Router();

router.use(authenticate);

router.get('/sessions', controller.listSessions);
router.get('/my', requireRole([UserRole.TRAINEE]), controller.getMyReport);
router.get('/summary', controller.getSummary);
router.get('/', controller.list);
router.post(
  '/',
  requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN, UserRole.TRAINER]),
  controller.markBulk,
);

export default router;
