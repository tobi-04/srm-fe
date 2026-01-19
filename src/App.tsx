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
import StudentManagementPage from "./pages/StudentManagementPage";
import SalerManagementPage from "./pages/SalerManagementPage";
import CourseManagementPage from "./pages/CourseManagementPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseViewerPage from "./pages/CourseViewerPage";
import LandingPageManagementPage from "./pages/LandingPageManagementPage";
import LandingPageBuilderPage from "./pages/LandingPageBuilderPage";
import LandingPagePreviewPage from "./pages/LandingPagePreviewPage";
import EmailAutomationPage from "./pages/EmailAutomationPage";
import StudentProgressPage from "./pages/StudentProgressPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import StudentCoursesPage from "./pages/StudentCoursesPage";
import StudentCoursePlayerPage from "./pages/StudentCoursePlayerPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentOrdersPage from "./pages/StudentOrdersPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountLockedModal from "./components/AccountLockedModal";

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

          {/* Student Course Viewer Routes - Protected */}
          <Route
            path="/learn/:courseId"
            element={
              <ProtectedRoute>
                <CourseViewerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/:courseId/lessons/:lessonId"
            element={
              <ProtectedRoute>
                <CourseViewerPage />
              </ProtectedRoute>
            }
          />

          {/* Student Dashboard Routes - Protected */}
          <Route
            path="/student"
            element={<Navigate to="/student/dashboard" replace />}
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute requiredRole="user">
                <StudentCoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/course/:slug"
            element={
              <ProtectedRoute requiredRole="user">
                <StudentCoursePlayerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/progress"
            element={
              <ProtectedRoute requiredRole="user">
                <StudentProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute requiredRole="user">
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/orders"
            element={
              <ProtectedRoute requiredRole="user">
                <StudentOrdersPage />
              </ProtectedRoute>
            }
          />

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
            element={<Navigate to="/admin/students" replace />}
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute requiredRole="admin">
                <StudentManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/salers"
            element={
              <ProtectedRoute requiredRole="admin">
                <SalerManagementPage />
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
          <Route
            path="/admin/landing-preview/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <LandingPagePreviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/email-automation"
            element={
              <ProtectedRoute requiredRole="admin">
                <EmailAutomationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/progress"
            element={
              <ProtectedRoute requiredRole="admin">
                <StudentProgressPage />
              </ProtectedRoute>
            }
          />

          {/* Public Landing Page Route - Must be last to avoid conflicts */}
          <Route path="/:slug" element={<LandingPageView />} />
        </Routes>
        <AccountLockedModal />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
