import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/notification.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/unread-count', controller.getUnreadCount);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', controller.markRead);

export default router;
