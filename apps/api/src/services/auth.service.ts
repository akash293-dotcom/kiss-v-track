import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import config from '../config';
import { UnauthorizedError, NotFoundError, ConflictError } from '../lib/errors';
import { Request } from 'express';

export const login = async (email: string, password: string, req: Request) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError('Invalid credentials');
  if (!user.isActive) throw new UnauthorizedError('Account is inactive');

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) throw new UnauthorizedError('Invalid credentials');

  const token = jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      ipAddress: req.ip || null,
      userAgent: req.get('user-agent') || null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day approx
    }
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  const { passwordHash, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};

export const logout = async (token: string, userId: string) => {
  await prisma.session.updateMany({
    where: { token, userId },
    data: { isValid: false }
  });
};

export const getUserProfile = async (id: string) => {
  const user = await prisma.user.findUnique({ 
    where: { id },
    include: { trainee: true, trainer: true, campus: true }
  });
  if (!user) throw new NotFoundError('User not found');
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const changePassword = async (userId: string, current: string, newPass: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');
  
  const isValid = await bcrypt.compare(current, user.passwordHash);
  if (!isValid) throw new UnauthorizedError('Incorrect current password');
  
  const passwordHash = await bcrypt.hash(newPass, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // Do not leak existence
  
  const token = Math.random().toString(36).substring(2, 15);
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      passwordResetToken: token,
      passwordResetExpiry: new Date(Date.now() + 3600000) // 1 hour
    }
  });
  // TODO: Send email
};

export const resetPassword = async (token: string, newPass: string) => {
  const user = await prisma.user.findFirst({
    where: { 
      passwordResetToken: token,
      passwordResetExpiry: { gt: new Date() }
    }
  });
  if (!user) throw new UnauthorizedError('Invalid or expired reset token');

  const passwordHash = await bcrypt.hash(newPass, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiry: null
    }
  });
};
