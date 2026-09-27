import { Request, Response, NextFunction } from 'express';
import * as certificateService from '../services/certificate.service';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await certificateService.list({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      traineeId: req.query.traineeId as string,
      status: req.query.status as string,
    });
    res.json({ success: true, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cert = await certificateService.getById(req.params.id!);
    res.json({ success: true, data: cert });
  } catch (error) {
    next(error);
  }
};

export const verifyCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await certificateService.verifyByCertificateNo(req.params.certificateNo!);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Certificate not found' },
      });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const checkEligibility = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { traineeId, electiveId } = req.query;
    if (!traineeId || !electiveId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'traineeId and electiveId are required' },
      });
    }
    const result = await certificateService.checkEligibility(traineeId as string, electiveId as string);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const issueCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cert = await certificateService.issueCertificate(req.body, req.user!.id);
    res.status(201).json({ success: true, data: cert });
  } catch (error) {
    next(error);
  }
};

export const revokeCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cert = await certificateService.revokeCertificate(req.params.id!, req.body.reason || 'Administrative action');
    res.json({ success: true, data: cert });
  } catch (error) {
    next(error);
  }
};
