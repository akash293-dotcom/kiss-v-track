import { Request, Response, NextFunction } from 'express';
import * as service from '../services/skill.service';

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
    await service.remove(req.params.id);
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    next(error);
  }
};

export const verifySkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user!.trainer?.id;
    if (!trainerId) throw new Error('Not a trainer');
    const data = await service.verifySkill(req.body, trainerId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTraineeSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getTraineeSkill(req.params.traineeId, req.params.skillId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateTraineeSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.updateTraineeSkill(req.params.traineeId, req.params.skillId, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
