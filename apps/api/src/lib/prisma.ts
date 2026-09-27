import { PrismaClient } from '@prisma/client';
import config from '../config';

const prismaGlobal = global as typeof global & {
  prisma?: PrismaClient;
};

const prisma = prismaGlobal.prisma || new PrismaClient({
  log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (config.env !== 'production') {
  prismaGlobal.prisma = prisma;
}

export { prisma };
export default prisma;
