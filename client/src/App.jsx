import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import MaintenanceList from './pages/MaintenanceList';
import MaintenanceDetail from './pages/MaintenanceDetail';
import MaintenanceForm from './pages/MaintenanceForm';
import MaintenanceKanban from './pages/MaintenanceKanban';
import MaintenanceCalendar from './pages/MaintenanceCalendar';
import TeamsPage from './pages/TeamsPage';
import TeamDetail from './pages/TeamDetail';
import TeamForm from './pages/TeamForm';
import WorkCentersPage from './pages/WorkCentersPage';
import WorkCenterDetail from './pages/WorkCenterDetail';
import WorkCenterForm from './pages/WorkCenterForm';
import EquipmentPage from './pages/EquipmentPage';
import EquipmentDetail from './pages/EquipmentDetail';
import EquipmentForm from './pages/EquipmentForm';
import CategoriesPage from './pages/CategoriesPage';
import ReportsPage from './pages/ReportsPage';

// Layout wrapper for protected routes
const ProtectedLayout = () => (
  <ProtectedRoute>
    <MainLayout>
      <Outlet />
    </MainLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected Routes with MainLayout */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Maintenance Routes */}
            <Route path="/maintenance" element={<MaintenanceList />} />
            <Route path="/maintenance/board" element={<MaintenanceKanban />} />
            <Route path="/maintenance/calendar" element={<MaintenanceCalendar />} />
            <Route path="/maintenance/new" element={<MaintenanceForm />} />
            <Route path="/maintenance/:id" element={<MaintenanceDetail />} />

            {/* Reports Route */}
            <Route path="/reports" element={<ReportsPage />} />

            {/* Teams Routes */}
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/new" element={<TeamForm />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/teams/:id/edit" element={<TeamForm />} />

            {/* Work Centers Routes */}
            <Route path="/work-centers" element={<WorkCentersPage />} />
            <Route path="/work-centers/new" element={<WorkCenterForm />} />
            <Route path="/work-centers/:id" element={<WorkCenterDetail />} />
            <Route path="/work-centers/:id/edit" element={<WorkCenterForm />} />

            {/* Equipment Routes */}
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route path="/equipment/new" element={<EquipmentForm />} />
            <Route path="/equipment/:id" element={<EquipmentDetail />} />
            <Route path="/equipment/:id/edit" element={<EquipmentForm />} />

            {/* Categories Route */}
            <Route path="/categories" element={<CategoriesPage />} />
          </Route>
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
