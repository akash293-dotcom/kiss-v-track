import { Request, Response, NextFunction } from 'express';
import * as service from '../services/dashboard.service';
import prisma from '../lib/prisma';
import { ForbiddenError } from '../lib/errors';
import { UserRole } from '@prisma/client';

export const getAdminDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let campusId = req.query.campusId as string | undefined;
    if (req.user!.role === UserRole.CENTRE_ADMIN) {
      if (!req.user!.campusId) throw new ForbiddenError('Centre admin is not assigned to a campus');
      if (campusId && campusId !== req.user!.campusId) throw new ForbiddenError('You cannot view another campus dashboard');
      campusId = req.user!.campusId;
    }
    const data = await service.getAdminDashboard(campusId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getTrainerDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainer = await prisma.trainer.findUnique({ where: { userId: req.user!.id } });
    if (!trainer) throw new ForbiddenError('Not a trainer');
    const data = await service.getTrainerDashboard(trainer.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getTraineeDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainee = await prisma.trainee.findUnique({ where: { userId: req.user!.id } });
    if (!trainee) throw new ForbiddenError('Not a trainee');
    const data = await service.getTraineeDashboard(trainee.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
