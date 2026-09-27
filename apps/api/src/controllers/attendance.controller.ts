import { Request, Response, NextFunction } from 'express';
import * as service from '../services/attendance.service';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const markBulk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const markedById = req.user!.id;
    const trainerId = req.user!.trainer?.id;
    const { sessionId, records } = req.body;
    
    const data = await service.markBulk(sessionId, records, markedById, trainerId);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getSummary(req.query as any);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
