import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as controller from '../controllers/certificate.controller';

const router = Router();

// Public: certificate verification (no auth needed)
// Mounted at /api/v1/verify/certificate AND /api/v1/certificates
router.get('/verify/:certificateNo', controller.verifyCertificate);

// Protected routes
router.use(authenticate);

router.get('/', controller.list);
router.get('/eligibility', controller.checkEligibility);
router.get('/:id', controller.getById);
router.post('/', requireRole('ADMIN', 'CENTRE_ADMIN'), controller.issueCertificate);
router.patch('/:id/revoke', requireRole('ADMIN', 'CENTRE_ADMIN'), controller.revokeCertificate);

export default router;
