import { Request, Response, NextFunction } from 'express';
import * as service from '../services/trainer.service';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getProfile(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.create(req.body);
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
    const data = await service.remove(req.params.id);
    res.json({ success: true, data, message: 'Trainer deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getBatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getBatches(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
