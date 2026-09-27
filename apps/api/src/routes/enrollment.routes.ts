import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import * as controller from '../controllers/enrollment.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.post('/', requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN]), controller.create);
router.patch('/:id', requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN]), controller.update);

export default router;
