import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Public
import CertificateVerify from './pages/certificates/CertificateVerify';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import CampusList from './pages/campuses/CampusList';
import CampusForm from './pages/campuses/CampusForm';
import CategoryList from './pages/categories/CategoryList';
import CategoryForm from './pages/categories/CategoryForm';
import ElectiveList from './pages/electives/ElectiveList';
import ElectiveForm from './pages/electives/ElectiveForm';
import ElectiveDetail from './pages/electives/ElectiveDetail';
import TraineeList from './pages/trainees/TraineeList';
import TraineeForm from './pages/trainees/TraineeForm';
import TraineeDetail from './pages/trainees/TraineeDetail';
import TrainerList from './pages/trainers/TrainerList';
import TrainerForm from './pages/trainers/TrainerForm';
import TrainerDetail from './pages/trainers/TrainerDetail';
import BatchList from './pages/batches/BatchList';
import BatchForm from './pages/batches/BatchForm';
import BatchDetail from './pages/batches/BatchDetail';
import SkillList from './pages/skills/SkillList';
import SkillForm from './pages/skills/SkillForm';
import SessionList from './pages/sessions/SessionList';
import SessionForm from './pages/sessions/SessionForm';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ProductDetail from './pages/products/ProductDetail';
import ProductReview from './pages/products/ProductReview';
import AssessmentList from './pages/assessments/AssessmentList';
import AssessmentForm from './pages/assessments/AssessmentForm';
import CertificateList from './pages/certificates/CertificateList';
import CertificateDetail from './pages/certificates/CertificateDetail';
import CertificateIssue from './pages/certificates/CertificateIssue';
import ReportsPage from './pages/reports/ReportsPage';
import EnrollmentForm from './pages/enrollments/EnrollmentForm';

// Trainer
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import AttendanceMarking from './pages/attendance/AttendanceMarking';
import AttendanceReport from './pages/attendance/AttendanceReport';
import TaskList from './pages/tasks/TaskList';
import TaskForm from './pages/tasks/TaskForm';
import TaskDetail from './pages/tasks/TaskDetail';

// Trainee
import TraineeDashboard from './pages/trainee/TraineeDashboard';
import SkillPassport from './pages/trainee/SkillPassport';

const App = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading KISS V-TRACK...</p>
        </div>
      </div>
    );
  }

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'CENTRE_ADMIN': return '/admin/dashboard';
      case 'TRAINER': return '/trainer/dashboard';
      case 'TRAINEE': return '/trainee/dashboard';
      default: return '/login';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={getDashboardPath()} />} />
      <Route path="/verify/certificate/:certificateNo" element={<CertificateVerify />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute requiredRoles={['ADMIN', 'CENTRE_ADMIN']}><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        {/* Campuses */}
        <Route path="campuses" element={<CampusList />} />
        <Route path="campuses/new" element={<CampusForm />} />
        <Route path="campuses/:id/edit" element={<CampusForm />} />
        {/* Categories */}
        <Route path="categories" element={<CategoryList />} />
        <Route path="categories/new" element={<CategoryForm />} />
        <Route path="categories/:id/edit" element={<CategoryForm />} />
        {/* Electives */}
        <Route path="electives" element={<ElectiveList />} />
        <Route path="electives/new" element={<ElectiveForm />} />
        <Route path="electives/:id" element={<ElectiveDetail />} />
        <Route path="electives/:id/edit" element={<ElectiveForm />} />
        {/* Trainees */}
        <Route path="trainees" element={<TraineeList />} />
        <Route path="trainees/new" element={<TraineeForm />} />
        <Route path="trainees/:id" element={<TraineeDetail />} />
        <Route path="trainees/:id/edit" element={<TraineeForm />} />
        {/* Trainers */}
        <Route path="trainers" element={<TrainerList />} />
        <Route path="trainers/new" element={<TrainerForm />} />
        <Route path="trainers/:id" element={<TrainerDetail />} />
        <Route path="trainers/:id/edit" element={<TrainerForm />} />
        {/* Batches */}
        <Route path="batches" element={<BatchList />} />
        <Route path="batches/new" element={<BatchForm />} />
        <Route path="batches/:id" element={<BatchDetail />} />
        <Route path="batches/:id/edit" element={<BatchForm />} />
        {/* Skills */}
        <Route path="skills" element={<SkillList />} />
        <Route path="skills/new" element={<SkillForm />} />
        <Route path="skills/:id/edit" element={<SkillForm />} />
        {/* Sessions */}
        <Route path="sessions" element={<SessionList />} />
        <Route path="sessions/new" element={<SessionForm />} />
        <Route path="sessions/:id/edit" element={<SessionForm />} />
        {/* Modules (nested under electives) */}
        {/* Products */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/:id" element={<ProductDetail />} />
        {/* Assessments */}
        <Route path="assessments" element={<AssessmentList />} />
        <Route path="assessments/new" element={<AssessmentForm />} />
        {/* Certificates */}
        <Route path="certificates" element={<CertificateList />} />
        <Route path="certificates/issue" element={<CertificateIssue />} />
        <Route path="certificates/:id" element={<CertificateDetail />} />
        {/* Enrollment */}
        <Route path="enrollments/new" element={<EnrollmentForm />} />
        {/* Reports */}
        <Route path="reports" element={<ReportsPage />} />
        {/* Attendance */}
        <Route path="attendance" element={<AttendanceReport />} />
        <Route path="attendance/:sessionId" element={<AttendanceMarking />} />
      </Route>

      {/* Trainer Routes */}
      <Route path="/trainer" element={<ProtectedRoute requiredRoles={['TRAINER']}><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<TrainerDashboard />} />
        <Route path="batches" element={<BatchList />} />
        <Route path="batches/:id" element={<BatchDetail />} />
        <Route path="sessions" element={<SessionList />} />
        <Route path="sessions/new" element={<SessionForm />} />
        <Route path="sessions/:id/edit" element={<SessionForm />} />
        <Route path="attendance/:sessionId" element={<AttendanceMarking />} />
        <Route path="attendance" element={<AttendanceReport />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="tasks/new" element={<TaskForm />} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="products/:id/review" element={<ProductReview />} />
        <Route path="assessments" element={<AssessmentList />} />
        <Route path="assessments/new" element={<AssessmentForm />} />
        <Route path="skills" element={<SkillList />} />
        <Route path="trainees/:id" element={<TraineeDetail />} />
      </Route>

      {/* Trainee Routes */}
      <Route path="/trainee" element={<ProtectedRoute requiredRoles={['TRAINEE']}><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<TraineeDashboard />} />
        <Route path="schedule" element={<SessionList />} />
        <Route path="attendance" element={<AttendanceReport />} />
        <Route path="skills" element={<SkillList />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="assessments" element={<AssessmentList />} />
        <Route path="certificates" element={<CertificateList />} />
        <Route path="certificates/:id" element={<CertificateDetail />} />
        <Route path="skill-passport" element={<SkillPassport />} />
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to={getDashboardPath()} />} />
      <Route path="*" element={<Navigate to={getDashboardPath()} />} />
    </Routes>
  );
};

export default App;
