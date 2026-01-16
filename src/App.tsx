import { ConfigProvider } from "antd";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import LandingPageView from "./pages/landing/LandingPageView";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import UserManagementPage from "./pages/UserManagementPage";
import CourseManagementPage from "./pages/CourseManagementPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LandingPageManagementPage from "./pages/LandingPageManagementPage";
import LandingPageBuilderPage from "./pages/LandingPageBuilderPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ConfigProvider
      componentSize="middle"
      theme={{
        token: {
          colorPrimary: "#f78404",
          borderRadius: 8,
        },
      }}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing/:slug" element={<LandingPageView />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          {/* Admin Routes - Protected */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute requiredRole="admin">
                <CourseManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses/:slug"
            element={
              <ProtectedRoute requiredRole="admin">
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/landing-pages"
            element={
              <ProtectedRoute requiredRole="admin">
                <LandingPageManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/landing-builder/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <LandingPageBuilderPage />
              </ProtectedRoute>
            }
          />

          {/* Public Landing Page Route - Must be last to avoid conflicts */}
          <Route path="/:slug" element={<LandingPageView />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
