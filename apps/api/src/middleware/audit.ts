import prisma from '../lib/prisma';
import { Request } from 'express';
import { logger } from '../lib/logger';

export const createAuditLog = async (
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  oldValues: Record<string, any> | null,
  newValues: Record<string, any> | null,
  req?: Request
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        ipAddress: req?.ip || null,
        userAgent: req?.get('user-agent') || null,
      },
    });
  } catch (error) {
    logger.error('Failed to create audit log', { error, userId, action, entity });
  }
};
