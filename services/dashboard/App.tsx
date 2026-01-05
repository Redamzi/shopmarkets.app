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
  const { user, isAuthenticated, setUser, session } = useAuthStore();
  const location = useLocation();
  const [showAVV, setShowAVV] = useState(false);

  useEffect(() => {
    // Check if user needs to sign AVV
    if (isAuthenticated && user && !(user as any).is_avv_signed) {
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
      // 1. Sofort lokal schließen und Status setzen (optimistic UI)
      setShowAVV(false);

      if (user) {
        setUser({ ...user, is_avv_signed: true } as any);
      }

      // 2. Im Hintergrund vom Backend nachladen
      const token = session?.access_token;
      if (token) {
        const response = await fetch('https://security.shopmarkets.app/api/auth/verify-token', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Nur updaten, wenn immer noch der gleiche User
          setUser(data.user);
        }
      }

      setShowAVV(false);
    } catch (e) {
      console.error("Failed to reload user after AVV", e);
      // Fallback: just close modal and set flag locally
      setUser({
        ...user!,
        is_avv_signed: true
      } as any);
      setShowAVV(false);
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

      {/* DEBUG OVERLAY - REMOVE LATER */}
      {process.env.NODE_ENV === 'production' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
          background: 'red',
          color: 'white',
          padding: '10px',
          fontSize: '12px',
          maxWidth: '300px',
          pointerEvents: 'none',
          opacity: 0.8
        }}>
          <div><strong>DEBUG INFO:</strong></div>
          <div>User ID: {user?.id}</div>
          <div>AVV Signed (Store): {String((user as any)?.is_avv_signed)}</div>
        </div>
      )}



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