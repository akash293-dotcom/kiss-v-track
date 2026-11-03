import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import * as controller from '../controllers/product.controller';

const router = Router();
router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', requireRole([UserRole.TRAINEE]), controller.create);
router.patch('/:id', requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN, UserRole.TRAINEE]), controller.update);
router.delete('/:id', requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN, UserRole.TRAINEE]), controller.remove);
router.post('/:id/review', requireRole([UserRole.TRAINER]), controller.reviewProduct);

export default router;
