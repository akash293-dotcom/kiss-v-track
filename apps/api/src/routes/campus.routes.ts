import { Request } from 'express';
import { Router } from 'express';
import * as campusController from '../controllers/campus.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createCampusSchema = z.object({
  body: z.object({
    organizationId: z.string().uuid(),
    name: z.string().min(2),
    code: z.string().min(2),
    description: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  })
});

const updateCampusSchema = z.object({
  body: createCampusSchema.shape.body.partial()
});

router.use(authenticate);

router.get('/', campusController.listCampuses);
router.get('/:id', campusController.getCampus);

router.post('/', requireRole('ADMIN'), validate(createCampusSchema), campusController.createCampus);
router.patch('/:id', requireRole('ADMIN'), validate(updateCampusSchema), campusController.updateCampus);
router.delete('/:id', requireRole('ADMIN'), campusController.deleteCampus);

export default router;
