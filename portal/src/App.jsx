import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyOTP from './pages/Auth/VerifyOTP';
import ForgotPassword from './pages/Auth/ForgotPassword';

// User Pages
import Discover from './pages/User/Discover';
import Chat from './pages/User/Chat';
import ProfileWizard from './pages/User/ProfileWizard';
import Subscription from './pages/User/Subscription';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center text-[#605252]">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isEmailVerified || !user.isPhoneVerified) {
    return <Navigate to="/verify-otp" state={{ userId: user.id, email: user.email }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1515]">
      <Navbar />
      <main className="md:pl-64 pt-16 md:pt-0 pb-20 md:pb-8 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center text-[#605252]">
        Checking credentials...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1515]">
      <Navbar />
      <main className="md:pl-64 pt-16 md:pt-0 pb-20 md:pb-8 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* User Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Discover />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              }
            />

            {/* Admin-Only Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
