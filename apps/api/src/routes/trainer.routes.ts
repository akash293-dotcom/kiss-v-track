import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import * as controller from '../controllers/trainer.controller';

const router = Router();

router.use(authenticate);

router.get('/', requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN]), controller.list);
router.get('/:id', controller.getProfile);
router.post('/', requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN]), controller.create);
router.patch('/:id', requireRole([UserRole.ADMIN, UserRole.CENTRE_ADMIN]), controller.update);
router.get('/:id/batches', controller.getBatches);

export default router;
