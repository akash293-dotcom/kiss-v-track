import { Request, Response, NextFunction } from 'express';
import * as service from '../services/batch.service';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try { const data = await service.list(req.query, req.user!); res.json({ success: true, data }); }
  catch (error) { next(error); }
};
export const get = async (req: Request, res: Response, next: NextFunction) => {
  try { const data = await service.get(req.params.id, req.user!); res.json({ success: true, data }); }
  catch (error) { next(error); }
};
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try { const data = await service.create({ ...req.body }, req.user!); res.status(201).json({ success: true, data }); }
  catch (error) { next(error); }
};
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try { const data = await service.update(req.params.id, req.body, req.user!); res.json({ success: true, data }); }
  catch (error) { next(error); }
};
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try { const data = await service.remove(req.params.id, req.user!); res.json({ success: true, data, message: 'Batch cancelled; training history was preserved' }); }
  catch (error) { next(error); }
};
export const getEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try { const data = await service.getEnrollments(req.params.id, req.user!); res.json({ success: true, data }); }
  catch (error) { next(error); }
};
export const getSessions = async (req: Request, res: Response, next: NextFunction) => {
  try { const data = await service.getSessions(req.params.id, req.user!); res.json({ success: true, data }); }
  catch (error) { next(error); }
};
