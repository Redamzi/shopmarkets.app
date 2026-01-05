import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './components/Dashboard';
import { ProductsPage } from './components/ProductsPage';
import { Connections } from './components/Connections';
import { SyncHistory } from './components/SyncHistory';
import { Billing } from './components/Billing';
import { Settings } from './components/Settings';
import { Onboarding } from './components/Onboarding';
import { AVVModal } from './components/AVVModal';
import { useAuthStore } from './store/authStore';
import { authService } from './services/authService';

// Wrapper component to handle AVV and Onboarding logic
const AppContent: React.FC = () => {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const location = useLocation();
  const [showAVV, setShowAVV] = useState(false);

  useEffect(() => {
    // Check if user needs to sign AVV
    if (isAuthenticated && user && !(user as any).avv_accepted_at) {
      // Don't show on login/register
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        setShowAVV(true);
      }
    } else {
      setShowAVV(false);
    }
  }, [isAuthenticated, user, location]);

  const handleAVVSigned = async () => {
    try {
      await authService.signAVV();

      // Update local user state to prevent modal from showing again
      setUser({
        ...user!,
        avv_accepted_at: new Date().toISOString()
      } as any);

      setShowAVV(false);
    } catch (e) {
      console.error("Failed to sign AVV", e);
    }
  };

  return (
    <>
      <AVVModal isOpen={showAVV} onSigned={handleAVVSigned} />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="connections" element={<Connections />} />
          <Route path="sync-history" element={<SyncHistory />} />
          <Route path="billing" element={<Billing />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Onboarding Route (Protected but outside Layout) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;