import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@heroui/react';

// Layouts
import MainLayout from './layouts/main-layout';
import AuthLayout from './layouts/auth-layout';
import DashboardLayout from './layouts/dashboard-layout';

// Auth Pages
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import ForgotPassword from './pages/auth/forgot-password';

// Protected Pages
import Dashboard from './pages/dashboard';
import ListeningTest from './pages/tests/listening-test';
import ReadingTest from './pages/tests/reading-test';
import WritingTest from './pages/tests/writing-test';
import SpeakingTest from './pages/tests/speaking-test';
import Results from './pages/results';
import Profile from './pages/profile';
import Leaderboard from './pages/leaderboard';
import Settings from './pages/settings';

// Public Pages
import Home from './pages/home';
import About from './pages/about';

// Admin Page
import AdminDashboard from './pages/admin';

// Auth Provider
import { AuthProvider, useAuth } from './contexts/auth-context';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" color="primary" label="Loading..." />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { i18n } = useTranslation();
  
  React.useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Route>
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
        
        {/* Protected Routes */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test/listening" element={<ListeningTest />} />
          <Route path="/test/reading" element={<ReadingTest />} />
          <Route path="/test/writing" element={<WritingTest />} />
          <Route path="/test/speaking" element={<SpeakingTest />} />
          <Route path="/results" element={<Results />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;