import { Request, Response, NextFunction } from 'express';
import * as service from '../services/product.service';

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
    const traineeId = req.user!.trainee?.id;
    if (!traineeId) throw new Error('Not a trainee');
    const data = await service.create({ ...req.body, traineeId });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const data = await service.update(req.params.id, req.body, userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

export const reviewProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.trainer?.id;
    const userId = req.user!.id;
    if (!trainerId) throw new Error('Not a trainer');
    const data = await service.reviewProduct(req.params.id, req.body, trainerId, userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
