import { Request, Response, NextFunction } from 'express';
import * as service from '../services/trainee.service';
import prisma from '../lib/prisma';
import { AppError, ForbiddenError } from '../lib/errors';
import { UserRole } from '@prisma/client';

const assertTraineeReadAccess = async (req: Request, traineeId: string) => {
  const trainee = await prisma.trainee.findUnique({
    where: { id: traineeId },
    select: { id: true, userId: true, campusId: true },
  });
  if (!trainee) throw new AppError('Trainee not found', 404);

  const actor = req.user!;
  if (actor.role === UserRole.ADMIN) return trainee;
  if (actor.role === UserRole.CENTRE_ADMIN && trainee.campusId === actor.campusId) return trainee;
  if (actor.role === UserRole.TRAINEE && trainee.userId === actor.id) return trainee;
  if (actor.role === UserRole.TRAINER && actor.trainer?.id) {
    const assignment = await prisma.enrollment.findFirst({
      where: {
        traineeId,
        status: 'ACTIVE',
        batch: { trainerId: actor.trainer.id },
      },
      select: { id: true },
    });
    if (assignment) return trainee;
  }
  throw new ForbiddenError('You do not have access to this trainee record');
};

const assertTraineeManageAccess = async (req: Request, traineeId: string) => {
  const trainee = await assertTraineeReadAccess(req, traineeId);
  if (req.user!.role !== UserRole.ADMIN && req.user!.role !== UserRole.CENTRE_ADMIN) {
    throw new ForbiddenError('Only administrators can change trainee records');
  }
  if (req.user!.role === UserRole.CENTRE_ADMIN && trainee.campusId !== req.user!.campusId) {
    throw new ForbiddenError('You can only manage trainees in your campus');
  }
  return trainee;
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: any = { ...req.query };
    if (req.user!.role === UserRole.CENTRE_ADMIN) query.campusId = req.user!.campusId;
    if (req.user!.role === UserRole.TRAINER) query.trainerId = req.user!.trainer?.id;
    const data = await service.list(query);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertTraineeReadAccess(req, req.params.id);
    const data = await service.getProfile(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = { ...req.body };
    if (req.user!.role === UserRole.CENTRE_ADMIN) {
      if (!req.user!.campusId) throw new ForbiddenError('Centre administrator is not assigned to a campus');
      body.campusId = req.user!.campusId;
    }
    const data = await service.create(body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await assertTraineeManageAccess(req, req.params.id);
    if (req.user!.role === UserRole.CENTRE_ADMIN && req.body.campusId && req.body.campusId !== existing.campusId) {
      throw new ForbiddenError('You cannot transfer a trainee outside your campus');
    }
    const data = await service.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertTraineeManageAccess(req, req.params.id);
    const data = await service.remove(req.params.id);
    res.json({ success: true, data, message: 'Trainee deactivated successfully' });
  } catch (error) { next(error); }
};

export const getSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertTraineeReadAccess(req, req.params.id);
    const data = await service.getSkills(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getAttendanceSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertTraineeReadAccess(req, req.params.id);
    const data = await service.getAttendanceSummary(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertTraineeReadAccess(req, req.params.id);
    const data = await service.getProducts(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getCertificates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertTraineeReadAccess(req, req.params.id);
    const data = await service.getCertificates(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getSkillPassport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertTraineeReadAccess(req, req.params.id);
    const data = await service.getSkillPassport(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
