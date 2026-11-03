import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import config from '../config';
import { UnauthorizedError, NotFoundError } from '../lib/errors';
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
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      ipAddress: req.ip || null,
      userAgent: req.get('user-agent') || null,
      expiresAt,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const {
    passwordHash: _passwordHash,
    passwordResetToken: _passwordResetToken,
    passwordResetExpiry: _passwordResetExpiry,
    ...safeUser
  } = user;
  return { token, user: safeUser };
};

export const logout = async (token: string, userId: string) => {
  await prisma.session.updateMany({
    where: { token, userId },
    data: { isValid: false },
  });
};

export const getUserProfile = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { trainee: true, trainer: true, campus: true },
  });
  if (!user) throw new NotFoundError('User not found');

  const {
    passwordHash: _passwordHash,
    passwordResetToken: _passwordResetToken,
    passwordResetExpiry: _passwordResetExpiry,
    ...safeUser
  } = user;
  return safeUser;
};

export const changePassword = async (userId: string, current: string, newPass: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  const isValid = await bcrypt.compare(current, user.passwordHash);
  if (!isValid) throw new UnauthorizedError('Incorrect current password');

  const passwordHash = await bcrypt.hash(newPass, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.session.updateMany({ where: { userId }, data: { isValid: false } }),
  ]);
};

// Password reset delivery is intentionally not simulated. There is no configured
// email provider in this repository; users are directed to their administrator
// rather than receiving a success response for a link that was never sent.
export const forgotPassword = async (_email: string) => {
  return;
};

export const resetPassword = async (_token: string, _newPass: string) => {
  throw new UnauthorizedError('Password reset by email is not configured. Please contact your administrator.');
};
