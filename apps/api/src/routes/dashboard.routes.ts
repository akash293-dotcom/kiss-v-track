import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as controller from '../controllers/dashboard.controller';

const router = Router();

router.use(authenticate);

router.get('/admin', requireRole('ADMIN', 'CENTRE_ADMIN'), controller.getAdminDashboard);
router.get('/trainer', requireRole('TRAINER'), controller.getTrainerDashboard);
router.get('/trainee', requireRole('TRAINEE'), controller.getTraineeDashboard);

export default router;
