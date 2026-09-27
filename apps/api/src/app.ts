import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { logger } from './lib/logger';
import { NotFoundError } from './lib/errors';

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request ID and Logging
app.use(requestId);
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1', routes);

// 404 Handler
app.use((req: Request, res: Response, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Error Handling
app.use(errorHandler);

export default app;
