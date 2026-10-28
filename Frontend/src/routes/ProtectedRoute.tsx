import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { PATHS } from "@/constants/paths";
import BadRequestPage from "@/pages/BadRequestPage";
import { LoadingScreen } from "@/components/common";

interface ProtectedRouteProps {
  allowRoles?: string[];
  userRole?: string;
}

export const ProtectedRoute = ({
  allowRoles = ["candidate", "admin", "recruiter"],
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  const userRole = user?.roles?.[0]?.toLowerCase();

  // Đang kiểm tra phiên làm việc khi F5 -> Chờ kết quả, không chuyển hướng vội
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <LoadingScreen />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={PATHS.SIGN_IN} state={{ from: location }} replace />;
  }

  if (allowRoles && userRole && !allowRoles.includes(userRole)) {
    return (
      <BadRequestPage
        httpCode="403"
        title="Forbidden"
        description="Rất tiếc bạn không có quyền truy cập!"
      />
    );
  }

  return <Outlet />;
};
