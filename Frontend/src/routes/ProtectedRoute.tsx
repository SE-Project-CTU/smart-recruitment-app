import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { PATHS } from "@/constants/paths";
import BadRequestPage from "@/pages/BadRequestPage";

interface ProtectedRouteProps {
  allowRoles?: string[];
  userRole?: string;
}
export const ProtectedRoute = ({
  allowRoles = ["candidate", "admin", "recruiter"],
}: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore().user?.roles[0].toLowerCase();

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
