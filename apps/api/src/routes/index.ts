import { Router } from 'express';
import authRoutes from './auth.routes';
import campusRoutes from './campus.routes';
import traineeRoutes from './trainee.routes';
import trainerRoutes from './trainer.routes';
import categoryRoutes from './category.routes';
import electiveRoutes from './elective.routes';
import moduleRoutes from './module.routes';
import skillRoutes from './skill.routes';
import batchRoutes from './batch.routes';
import enrollmentRoutes from './enrollment.routes';
import sessionRoutes from './session.routes';
import attendanceRoutes from './attendance.routes';
import productRoutes from './product.routes';
import taskRoutes from './task.routes';
import assessmentRoutes from './assessment.routes';
import certificateRoutes from './certificate.routes';
import dashboardRoutes from './dashboard.routes';
import notificationRoutes from './notification.routes';
import reportRoutes from './report.routes';

const router = Router();

// Auth
router.use('/auth', authRoutes);

// Core data
router.use('/campuses', campusRoutes);
router.use('/trainees', traineeRoutes);
router.use('/trainers', trainerRoutes);
router.use('/categories', categoryRoutes);
router.use('/electives', electiveRoutes);
router.use('/modules', moduleRoutes);
router.use('/skills', skillRoutes);

// Training
router.use('/batches', batchRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/sessions', sessionRoutes);
router.use('/attendance', attendanceRoutes);

// Products & Tasks
router.use('/products', productRoutes);
router.use('/tasks', taskRoutes);

// Assessment & Certification
router.use('/assessments', assessmentRoutes);
router.use('/certificates', certificateRoutes);

// Dashboard & Reports
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);

export default router;
