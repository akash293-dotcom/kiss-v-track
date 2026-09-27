import { Request, Response, NextFunction } from 'express';
import * as service from '../services/report.service';

export const getTraineeReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getTraineeReport(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getBatchReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getBatchReport(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getInstitutionalReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getInstitutionalReport();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
