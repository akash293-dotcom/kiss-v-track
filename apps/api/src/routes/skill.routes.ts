import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import * as controller from '../controllers/skill.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', requireRole([UserRole.ADMIN]), controller.create);
router.patch('/:id', requireRole([UserRole.ADMIN]), controller.update);
router.delete('/:id', requireRole([UserRole.ADMIN]), controller.remove);

// Trainee skill specific endpoints
router.post('/verify', requireRole([UserRole.TRAINER]), controller.verifySkill);
router.get('/trainees/:traineeId/skills/:skillId', controller.getTraineeSkill);
router.patch('/trainees/:traineeId/skills/:skillId', requireRole([UserRole.TRAINER]), controller.updateTraineeSkill);

export default router;
