import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import * as controller from '../controllers/trainee.controller';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requireRole([
    UserRole.ADMIN,
    UserRole.CENTRE_ADMIN,
    UserRole.TRAINER
  ]),
  controller.list
);

router.get(
  '/:id',
  controller.getProfile
);

router.post(
  '/',
  requireRole([
    UserRole.ADMIN,
    UserRole.CENTRE_ADMIN
  ]),
  controller.create
);

router.patch(
  '/:id',
  requireRole([
    UserRole.ADMIN,
    UserRole.CENTRE_ADMIN
  ]),
  controller.update
);

router.delete(
  '/:id',
  requireRole([
    UserRole.ADMIN,
    UserRole.CENTRE_ADMIN
  ]),
  controller.remove
);

router.get(
  '/:id/skills',
  controller.getSkills
);

router.get(
  '/:id/attendance-summary',
  controller.getAttendanceSummary
);

router.get(
  '/:id/products',
  controller.getProducts
);

router.get(
  '/:id/certificates',
  controller.getCertificates
);

router.get(
  '/:id/skill-passport',
  controller.getSkillPassport
);

export default router;