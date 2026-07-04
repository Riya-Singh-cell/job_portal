import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { getMe } from './redux/slices/authSlice';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages - Public
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Companies from './pages/Companies';
import NotFound from './pages/NotFound';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Pages - Candidate Dashboard
import CandidateDashboard from './pages/candidate/Dashboard';
import CandidateProfile from './pages/candidate/Profile';
import CandidateApplications from './pages/candidate/Applications';
import SavedJobs from './pages/candidate/SavedJobs';
import Recommendations from './pages/candidate/Recommendations';

// Pages - Recruiter Dashboard
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterJobs from './pages/recruiter/Jobs';
import JobApplications from './pages/recruiter/JobApplications';
import CreateJob from './pages/recruiter/CreateJob';
import EditJob from './pages/recruiter/EditJob';
import CompanyProfile from './pages/recruiter/CompanyProfile';

// Pages - Admin Dashboard
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminJobs from './pages/admin/Jobs';
import AdminReports from './pages/admin/Reports';

// Components
import LoadingScreen from './components/ui/LoadingScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App = () => {
  const dispatch = useDispatch();
  const { token, initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
    } else {
      // No token — mark as initialized immediately
      dispatch({ type: 'auth/getMe/rejected' });
    }
  }, [dispatch, token]);

  if (!initialized && token) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Inter, sans-serif',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/companies" element={<Companies />} />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Route>

        {/* Candidate routes */}
        <Route
          path="/candidate"
          element={
            <ProtectedRoute roles={['candidate']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/candidate/dashboard" replace />} />
          <Route path="dashboard" element={<CandidateDashboard />} />
          <Route path="profile" element={<CandidateProfile />} />
          <Route path="applications" element={<CandidateApplications />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
          <Route path="recommendations" element={<Recommendations />} />
        </Route>

        {/* Recruiter routes */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute roles={['recruiter']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
          <Route path="dashboard" element={<RecruiterDashboard />} />
          <Route path="jobs" element={<RecruiterJobs />} />
          <Route path="jobs/create" element={<CreateJob />} />
          <Route path="jobs/:id/edit" element={<EditJob />} />
          <Route path="jobs/:id/applications" element={<JobApplications />} />
          <Route path="company" element={<CompanyProfile />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
