import { Request, Response, NextFunction } from 'express';
import * as service from '../services/task.service';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.get(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.trainer?.id;
    if (!trainerId) throw new Error('Not a trainer');
    const data = await service.create({ ...req.body, trainerId });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

export const submitTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const traineeId = req.user!.trainee?.id;
    if (!traineeId) throw new Error('Not a trainee');
    const data = await service.submitTask(req.params.id, { ...req.body, traineeId });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const reviewSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.reviewSubmission(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
