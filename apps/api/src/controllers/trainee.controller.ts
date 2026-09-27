import { Request, Response, NextFunction } from 'express';
import * as service from '../services/trainee.service';

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

export const getSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getSkills(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getAttendanceSummary(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getProducts(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getCertificates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getCertificates(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSkillPassport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getSkillPassport(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
