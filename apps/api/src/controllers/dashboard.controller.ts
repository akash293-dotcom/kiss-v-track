import { Request, Response, NextFunction } from 'express';
import * as service from '../services/dashboard.service';
import prisma from '../lib/prisma';
import { ForbiddenError } from '../lib/errors';

export const getAdminDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getAdminDashboard(req.query.campusId as string | undefined);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTrainerDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainer = await prisma.trainer.findUnique({ where: { userId: req.user!.id } });
    if (!trainer) throw new ForbiddenError('Not a trainer');
    const data = await service.getTrainerDashboard(trainer.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTraineeDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainee = await prisma.trainee.findUnique({ where: { userId: req.user!.id } });
    if (!trainee) throw new ForbiddenError('Not a trainee');
    const data = await service.getTraineeDashboard(trainee.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
