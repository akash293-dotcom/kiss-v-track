import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

export const list = async (query: any) => {
  const {
    page = 1,
    limit = 100,
    search,
  } = query;

  const where: any = {
    isActive: true,
  };

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        code: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  const categories = await prisma.vocationalCategory.findMany({
    where,
    orderBy: {
      sortOrder: 'asc',
    },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    include: {
      _count: {
        select: {
          electives: true,
          skills: true,
          trainerCategories: true,
        },
      },
    },
  });

  return categories;
};

export const get = async (id: string) => {
  const category = await prisma.vocationalCategory.findUnique({
    where: { id },
    include: {
      electives: true,
      skills: true,
      trainerCategories: true,
    },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return category;
};

export const create = async (data: any) => {
  const {
    name,
    code,
    description,
    icon,
    isActive = true,
    sortOrder = 0,
  } = data;

  const existingName = await prisma.vocationalCategory.findUnique({
    where: { name },
  });

  if (existingName) {
    throw new AppError('Category name already exists', 400);
  }

  const existingCode = await prisma.vocationalCategory.findUnique({
    where: { code },
  });

  if (existingCode) {
    throw new AppError('Category code already exists', 400);
  }

  return prisma.vocationalCategory.create({
    data: {
      name,
      code,
      description,
      icon,
      isActive,
      sortOrder,
    },
  });
};

export const update = async (id: string, data: any) => {
  const category = await prisma.vocationalCategory.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const {
    name,
    code,
    description,
    icon,
    isActive,
    sortOrder,
  } = data;

  if (name && name !== category.name) {
    const existingName = await prisma.vocationalCategory.findUnique({
      where: { name },
    });

    if (existingName && existingName.id !== id) {
      throw new AppError('Category name already exists', 400);
    }
  }

  if (code && code !== category.code) {
    const existingCode = await prisma.vocationalCategory.findUnique({
      where: { code },
    });

    if (existingCode && existingCode.id !== id) {
      throw new AppError('Category code already exists', 400);
    }
  }

  return prisma.vocationalCategory.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(code !== undefined && { code }),
      ...(description !== undefined && { description }),
      ...(icon !== undefined && { icon }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  });
};

export const remove = async (id: string) => {
  const category = await prisma.vocationalCategory.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return prisma.vocationalCategory.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
};