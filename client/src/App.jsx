import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Maintenance Routes */}
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute>
                <MaintenanceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/board"
            element={
              <ProtectedRoute>
                <MaintenanceKanban />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/calendar"
            element={
              <ProtectedRoute>
                <MaintenanceCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/new"
            element={
              <ProtectedRoute>
                <MaintenanceForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/:id"
            element={
              <ProtectedRoute>
                <MaintenanceDetail />
              </ProtectedRoute>
            }
          />

          {/* Reports Route */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Teams Routes */}
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <TeamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/new"
            element={
              <ProtectedRoute>
                <TeamForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/:id"
            element={
              <ProtectedRoute>
                <TeamDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/:id/edit"
            element={
              <ProtectedRoute>
                <TeamForm />
              </ProtectedRoute>
            }
          />

          {/* Work Centers Routes */}
          <Route
            path="/work-centers"
            element={
              <ProtectedRoute>
                <WorkCentersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/work-centers/new"
            element={
              <ProtectedRoute>
                <WorkCenterForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/work-centers/:id"
            element={
              <ProtectedRoute>
                <WorkCenterDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/work-centers/:id/edit"
            element={
              <ProtectedRoute>
                <WorkCenterForm />
              </ProtectedRoute>
            }
          />

          {/* Equipment Routes */}
          <Route
            path="/equipment"
            element={
              <ProtectedRoute>
                <EquipmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment/new"
            element={
              <ProtectedRoute>
                <EquipmentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment/:id"
            element={
              <ProtectedRoute>
                <EquipmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment/:id/edit"
            element={
              <ProtectedRoute>
                <EquipmentForm />
              </ProtectedRoute>
            }
          />

          {/* Categories Route */}
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          
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
