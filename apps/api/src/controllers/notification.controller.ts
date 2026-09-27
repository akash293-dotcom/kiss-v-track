import { Request, Response, NextFunction } from 'express';
import * as service from '../services/notification.service';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const data = await service.list(userId, req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const count = await service.getUnreadCount(userId);
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const data = await service.markRead(req.params.id, userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    await service.markAllRead(userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
