import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import * as controller from '../controllers/batch.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN]), controller.create);
router.patch('/:id', requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN]), controller.update);
router.delete('/:id', requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN]), controller.remove);

router.get('/:id/enrollments', controller.getEnrollments);
router.get('/:id/sessions', controller.getSessions);

export default router;
