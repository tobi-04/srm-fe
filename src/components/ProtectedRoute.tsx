import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'sale' | 'user';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();
  const { isAuthenticated, clearAuth } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      // If not authenticated in store, redirect immediately
      if (!isAuthenticated) {
        setLoading(false);
        setAuthorized(false);
        return;
      }

      try {
        // Call API to verify token and get user info
        const response = await authApi.getMe();

        // Check if user has required role
        if (requiredRole && response.user.role !== requiredRole) {
          setAuthorized(false);
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        // If API call fails, clear auth and redirect to login
        clearAuth();
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, requiredRole, clearAuth]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!authorized) {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Redirect to home if authenticated but not authorized for this role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
