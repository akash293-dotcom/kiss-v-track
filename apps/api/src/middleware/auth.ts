import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import prisma from '../lib/prisma';
import { UnauthorizedError } from '../lib/errors';
import { UserRole } from '@prisma/client';

interface JwtPayload {
  id: string;
  role?: UserRole;
  exp?: number;
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided'));
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return next(new UnauthorizedError('No token provided'));
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch {
    return next(new UnauthorizedError('Invalid or expired token'));
  }

  if (!decoded.id) {
    return next(new UnauthorizedError('Invalid token payload'));
  }

  try {
    // A signed JWT is also tied to a server-side session so logout and
    // session revocation take effect immediately, not only after JWT expiry.
    const [session, user] = await Promise.all([
      prisma.session.findFirst({
        where: {
          token,
          userId: decoded.id,
          isValid: true,
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          trainer: true,
          trainee: true,
        },
      }),
    ]);

    if (!session) {
      return next(new UnauthorizedError('Session is invalid or has expired. Please sign in again.'));
    }
    if (!user) {
      return next(new UnauthorizedError('User not found'));
    }
    if (!user.isActive) {
      return next(new UnauthorizedError('User account is inactive'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePhoto: user.profilePhoto,
      campusId: user.campusId,
      isActive: user.isActive,
      trainer: user.trainer,
      trainee: user.trainee,
    };
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireRole = (...roles: (UserRole | UserRole[])[]) => {
  const flatRoles = roles.flat();
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }
    if (!flatRoles.includes(req.user.role as UserRole)) {
      return next(new UnauthorizedError('Insufficient permissions'));
    }
    return next();
  };
};
