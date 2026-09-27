import { User, Trainer, Trainee } from '@prisma/client';

export type AuthUser = Partial<User> & {
  id: string;
  email: string;
  role: any;
  trainer?: Trainer | null;
  trainee?: Trainee | null;
  [key: string]: any;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      requestId?: string;
    }
  }
}
