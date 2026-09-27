import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import * as controller from '../controllers/session.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', requireRole([UserRole.ADMIN, UserRole.TRAINER]), controller.create);
router.patch('/:id', requireRole([UserRole.ADMIN, UserRole.TRAINER]), controller.update);
router.delete('/:id', requireRole([UserRole.ADMIN, UserRole.TRAINER]), controller.remove);

export default router;
