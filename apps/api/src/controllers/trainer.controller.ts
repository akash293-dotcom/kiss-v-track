import { Request, Response, NextFunction } from 'express';
import * as service from '../services/trainer.service';
import prisma from '../lib/prisma';
import { AppError, ForbiddenError } from '../lib/errors';
import { UserRole } from '@prisma/client';

const assertTrainerReadAccess = async (req: Request, trainerId: string) => {
  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId },
    select: { id: true, userId: true, campusId: true },
  });
  if (!trainer) throw new AppError('Trainer not found', 404);

  const actor = req.user!;
  if (actor.role === UserRole.ADMIN) return trainer;
  if (actor.role === UserRole.CENTRE_ADMIN && trainer.campusId === actor.campusId) return trainer;
  if (actor.role === UserRole.TRAINER && trainer.userId === actor.id) return trainer;
  throw new ForbiddenError('You do not have access to this trainer record');
};

const assertTrainerManageAccess = async (req: Request, trainerId: string) => {
  const trainer = await assertTrainerReadAccess(req, trainerId);
  if (req.user!.role !== UserRole.ADMIN && req.user!.role !== UserRole.CENTRE_ADMIN) {
    throw new ForbiddenError('Only administrators can change trainer records');
  }
  if (req.user!.role === UserRole.CENTRE_ADMIN && trainer.campusId !== req.user!.campusId) {
    throw new ForbiddenError('You can only manage trainers in your campus');
  }
  return trainer;
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: any = { ...req.query };
    if (req.user!.role === UserRole.CENTRE_ADMIN) query.campusId = req.user!.campusId;
    const data = await service.list(query);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertTrainerReadAccess(req, req.params.id);
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
    const existing = await assertTrainerManageAccess(req, req.params.id);
    if (req.user!.role === UserRole.CENTRE_ADMIN && req.body.campusId && req.body.campusId !== existing.campusId) {
      throw new ForbiddenError('You cannot transfer a trainer outside your campus');
    }
    const data = await service.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertTrainerManageAccess(req, req.params.id);
    const data = await service.remove(req.params.id);
    res.json({ success: true, data, message: 'Trainer deactivated successfully' });
  } catch (error) { next(error); }
};

export const getBatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertTrainerReadAccess(req, req.params.id);
    const data = await service.getBatches(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
