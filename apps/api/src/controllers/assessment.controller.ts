import { Request, Response, NextFunction } from 'express';
import * as service from '../services/assessment.service';
import { ForbiddenError } from '../lib/errors';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.list(req.query, req.user!);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.get(req.params.id, req.user!);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.trainer?.id;
    if (!trainerId) throw new ForbiddenError('Trainer profile not found');
    const data = await service.create({ ...req.body, trainerId });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.trainer?.id;
    if (!trainerId) throw new ForbiddenError('Trainer profile not found');
    const data = await service.update(req.params.id, req.body, trainerId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.trainer?.id;
    if (!trainerId) throw new ForbiddenError('Trainer profile not found');
    await service.remove(req.params.id, trainerId);
    res.json({ success: true, message: 'Assessment deleted' });
  } catch (error) { next(error); }
};
