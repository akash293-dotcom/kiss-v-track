import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import * as controller from '../controllers/module.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', requireRole([UserRole.ADMIN]), controller.create);
router.patch('/:id', requireRole([UserRole.ADMIN]), controller.update);
router.delete('/:id', requireRole([UserRole.ADMIN]), controller.remove);

export default router;
