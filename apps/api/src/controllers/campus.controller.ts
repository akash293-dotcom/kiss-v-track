import { Request, Response, NextFunction } from 'express';
import * as campusService from '../services/campus.service';

export const listCampuses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await campusService.listCampuses({ page, limit, search });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getCampus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await campusService.getCampus(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const createCampus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await campusService.createCampus(req.body, req.user!.id, req);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateCampus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await campusService.updateCampus(req.params.id, req.body, req.user!.id, req);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteCampus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await campusService.deleteCampus(req.params.id, req.user!.id, req);
    res.json({ success: true, message: 'Campus deleted successfully' });
  } catch (error) {
    next(error);
  }
};
