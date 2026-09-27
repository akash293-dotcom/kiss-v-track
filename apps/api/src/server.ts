import http from 'http';
import app from './app';
import config from './config';
import { logger } from './lib/logger';
import prisma from './lib/prisma';

const server = http.createServer(app);

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to the database');

    server.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port} in ${config.env} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully.');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Process terminated.');
    process.exit(0);
  });
});
