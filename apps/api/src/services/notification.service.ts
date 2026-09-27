import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const list = async (userId: string, query: any) => {
  const { page = 1, limit = 20, unreadOnly } = query;
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = { userId };
  if (unreadOnly === 'true') where.isRead = false;

  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return { total, page: Number(page), limit: Number(limit), notifications };
};

export const getUnreadCount = async (userId: string) => {
  return prisma.notification.count({ where: { userId, isRead: false } });
};

export const markRead = async (id: string, userId: string) => {
  const notif = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notif) throw new AppError('Notification not found', 404);

  return prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() }
  });
};

export const markAllRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() }
  });
};
