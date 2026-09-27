import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import * as controller from '../controllers/task.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', requireRole([UserRole.TRAINER]), controller.create);
router.patch('/:id', requireRole([UserRole.TRAINER]), controller.update);
router.delete('/:id', requireRole([UserRole.TRAINER]), controller.remove);

router.post('/:id/submit', requireRole([UserRole.TRAINEE]), controller.submitTask);
router.patch('/submissions/:id/review', requireRole([UserRole.TRAINER]), controller.reviewSubmission);

export default router;
