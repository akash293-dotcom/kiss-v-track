import { Request, Response, NextFunction } from 'express';
import * as service from '../services/report.service';
import prisma from '../lib/prisma';
import { ForbiddenError } from '../lib/errors';
import { UserRole } from '@prisma/client';

export const getTraineeReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainee = await prisma.trainee.findUnique({ where: { id: req.params.id }, select: { id: true, campusId: true } });
    if (!trainee) throw new ForbiddenError('Trainee report is not available');
    if (req.user!.role === UserRole.CENTRE_ADMIN && trainee.campusId !== req.user!.campusId) throw new ForbiddenError('You cannot access reports outside your campus');
    if (req.user!.role === UserRole.TRAINER) {
      const trainer = req.user!.trainer;
      const assignment = trainer ? await prisma.enrollment.findFirst({ where: { traineeId: trainee.id, status: 'ACTIVE', batch: { trainerId: trainer.id } } }) : null;
      if (!assignment) throw new ForbiddenError('You can only access reports for trainees in your assigned batches');
    }
    const data = await service.getTraineeReport(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getBatchReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const batch = await prisma.trainingBatch.findUnique({ where: { id: req.params.id }, select: { id: true, campusId: true, trainerId: true } });
    if (!batch) throw new ForbiddenError('Batch report is not available');
    if (req.user!.role === UserRole.CENTRE_ADMIN && batch.campusId !== req.user!.campusId) throw new ForbiddenError('You cannot access reports outside your campus');
    if (req.user!.role === UserRole.TRAINER && batch.trainerId !== req.user!.trainer?.id) throw new ForbiddenError('You can only access reports for your assigned batches');
    const data = await service.getBatchReport(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getInstitutionalReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campusId = req.user!.role === UserRole.CENTRE_ADMIN ? req.user!.campusId || undefined : undefined;
    const data = await service.getInstitutionalReport(campusId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
