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
    console.log('🔍 AVV Check:', {
      isAuthenticated,
      hasUser: !!user,
      avvAccepted: (user as any)?.avvAccepted,
      pathname: location.pathname
    });

    if (isAuthenticated && user && !(user as any).avvAccepted) {
      // Don't show on login/register
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        console.log('⚠️ Showing AVV Modal - User has not accepted AVV');
        setShowAVV(true);
      }
    } else if (isAuthenticated && user && (user as any).avvAccepted) {
      console.log('✅ AVV already accepted - Modal will NOT show');
      setShowAVV(false);
    }
  }, [isAuthenticated, user, location]);

  const handleAVVSigned = async () => {
    try {
      // Update local user state to reflect AVV acceptance
      if (user) {
        setUser({ ...user, avvAccepted: true } as any);
      }
      setShowAVV(false);

      // Redirect to onboarding if profile not complete
      // if (!(user as any)?.profile_completed) {
      //   navigate('/onboarding');
      // }
    } catch (e) {
      console.error("Failed to update user state after AVV signing", e);
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