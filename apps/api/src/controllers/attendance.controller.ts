import { Request, Response, NextFunction } from 'express';
import * as service from '../services/attendance.service';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = String(req.query.sessionId || '');
    const data = await service.getSessionAttendance(sessionId, req.user!);
    res.json({ success: true, data: data.records, meta: data.summary, session: data.session });
  } catch (error) {
    next(error);
  }
};

export const listSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.listSessions(req.query, {
      id: req.user!.id,
      role: req.user!.role,
      campusId: req.user!.campusId,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const markBulk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, records } = req.body;
    const data = await service.markBulk(sessionId, records, req.user!.id, req.user!);
    res.status(200).json({ success: true, data, message: 'Attendance saved successfully' });
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getSummary(req.query as any, req.user!);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getMyReport(req.user!.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
