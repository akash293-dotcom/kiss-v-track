import { Request, Response, NextFunction } from 'express';
import * as certificateService from '../services/certificate.service';
import { ForbiddenError } from '../lib/errors';
import { UserRole } from '@prisma/client';
import prisma from '../lib/prisma';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actor = req.user!;
    const result = await certificateService.list({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      traineeId: actor.role === UserRole.TRAINEE ? actor.trainee?.id : req.query.traineeId as string | undefined,
      status: req.query.status as string | undefined,
      campusId: actor.role === UserRole.CENTRE_ADMIN ? actor.campusId || undefined : undefined,
      trainerId: actor.role === UserRole.TRAINER ? actor.trainer?.id : undefined,
    });
    res.json({ success: true, data: result.data, meta: result.meta });
  } catch (error) { next(error); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cert = await certificateService.getById(req.params.id);
    const actor = req.user!;
    if (actor.role === UserRole.TRAINEE && cert.traineeId !== actor.trainee?.id) throw new ForbiddenError('You can only view your own certificates');
    if (actor.role === UserRole.CENTRE_ADMIN && cert.trainee.campusId !== actor.campusId) throw new ForbiddenError('You cannot access certificates outside your campus');
    if (actor.role === UserRole.TRAINER) {
      const assigned = actor.trainer ? await prisma.enrollment.findFirst({ where: { traineeId: cert.traineeId, status: 'ACTIVE', batch: { trainerId: actor.trainer.id } } }) : null;
      if (!assigned) throw new ForbiddenError('You can only view certificates for trainees in your assigned batches');
    }
    res.json({ success: true, data: cert });
  } catch (error) { next(error); }
};

export const verifyCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await certificateService.verifyByCertificateNo(req.params.certificateNo);
    if (!result) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Certificate not found' } });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const checkEligibility = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { traineeId, electiveId } = req.query;
    if (!traineeId || !electiveId) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'traineeId and electiveId are required' } });
    const actor = req.user!;
    const trainee = await prisma.trainee.findUnique({ where: { id: String(traineeId) }, select: { id: true, campusId: true } });
    if (!trainee) throw new ForbiddenError('Trainee is not available');
    if (actor.role === UserRole.TRAINEE && trainee.id !== actor.trainee?.id) throw new ForbiddenError('You can only check your own eligibility');
    if (actor.role === UserRole.CENTRE_ADMIN && trainee.campusId !== actor.campusId) throw new ForbiddenError('You cannot check trainees outside your campus');
    if (actor.role === UserRole.TRAINER) {
      const assigned = actor.trainer ? await prisma.enrollment.findFirst({ where: { traineeId: trainee.id, status: 'ACTIVE', batch: { trainerId: actor.trainer.id } } }) : null;
      if (!assigned) throw new ForbiddenError('You can only check trainees in your assigned batches');
    }
    const result = await certificateService.checkEligibility(String(traineeId), String(electiveId));
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const issueCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actor = req.user!;
    if (actor.role === UserRole.CENTRE_ADMIN) {
      const trainee = await prisma.trainee.findUnique({ where: { id: req.body.traineeId }, select: { campusId: true } });
      if (!trainee || trainee.campusId !== actor.campusId) throw new ForbiddenError('You can only issue certificates for trainees in your campus');
    }
    const cert = await certificateService.issueCertificate(req.body, actor.id);
    res.status(201).json({ success: true, data: cert });
  } catch (error) { next(error); }
};

export const revokeCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actor = req.user!;
    if (actor.role === UserRole.CENTRE_ADMIN) {
      const cert = await certificateService.getById(req.params.id);
      if (cert.trainee.campusId !== actor.campusId) throw new ForbiddenError('You cannot revoke certificates outside your campus');
    }
    const cert = await certificateService.revokeCertificate(req.params.id, req.body.reason || 'Administrative action');
    res.json({ success: true, data: cert });
  } catch (error) { next(error); }
};
