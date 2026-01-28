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
import StudentDashboardPage from "./pages/StudentDashboardPage";
import StudentCoursesPage from "./pages/StudentCoursesPage";
import StudentCoursePlayerPage from "./pages/StudentCoursePlayerPage";
import StudentOrdersPage from "./pages/StudentOrdersPage";
import SalerDashboardPage from "./pages/SalerDashboardPage";
import SalerOrdersPage from "./pages/SalerOrdersPage";
import SalerReferralLinksPage from "./pages/SalerReferralLinksPage";
import SalerCommissionsPage from "./pages/SalerCommissionsPage";
import SalerStudentsPage from "./pages/SalerStudentsPage";
import SalerKPIPage from "./pages/SalerKPIPage";
import SalerSettingsPage from "./pages/SalerSettingsPage";
import SalerWithdrawalPage from "./pages/SalerWithdrawalPage";
import AdminWithdrawalConfigPage from "./pages/AdminWithdrawalConfigPage";
import AdminWithdrawalListPage from "./pages/AdminWithdrawalListPage";
import AdminProgressPage from "./pages/AdminProgressPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import GoogleSheetPage from "./pages/GoogleSheetPage";
import BookListPage from "./pages/books/BookListPage";
import BookDetailPage from "./pages/books/BookDetailPage";
import MyBooksPage from "@/pages/books/MyBooksPage";
import BookManagementPage from "./pages/books/BookManagementPage";
import CouponManagementPage from "./pages/books/CouponManagementPage";
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
      }}
    >
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing/:slug" element={<LandingPageView />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          {/* Book Store Public Routes */}
          <Route path="/books" element={<BookListPage />} />
          <Route path="/books/:slug" element={<BookDetailPage />} />

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
            path="/student/my-books"
            element={
              <ProtectedRoute requiredRole="user">
                <MyBooksPage />
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

          {/* Saler Dashboard Routes - Protected */}
          <Route
            path="/saler"
            element={<Navigate to="/saler/dashboard" replace />}
          />
          <Route
            path="/saler/dashboard"
            element={
              <ProtectedRoute requiredRole="sale">
                <SalerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saler/orders"
            element={
              <ProtectedRoute requiredRole="sale">
                <SalerOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saler/links"
            element={
              <ProtectedRoute requiredRole="sale">
                <SalerReferralLinksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saler/commissions"
            element={
              <ProtectedRoute requiredRole="sale">
                <SalerCommissionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saler/students"
            element={
              <ProtectedRoute requiredRole="sale">
                <SalerStudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saler/kpi"
            element={
              <ProtectedRoute requiredRole="sale">
                <SalerKPIPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saler/settings"
            element={
              <ProtectedRoute requiredRole="sale">
                <SalerSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saler/withdrawals"
            element={
              <ProtectedRoute requiredRole="sale">
                <SalerWithdrawalPage />
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
            path="/admin/progress"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminProgressPage />
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
            path="/admin/withdrawal-config"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminWithdrawalConfigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/withdrawals"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminWithdrawalListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requiredRole="admin">
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/google-sheet"
            element={
              <ProtectedRoute requiredRole="admin">
                <GoogleSheetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books"
            element={
              <ProtectedRoute requiredRole="admin">
                <BookManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books/coupons"
            element={
              <ProtectedRoute requiredRole="admin">
                <CouponManagementPage />
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
