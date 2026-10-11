import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface PublicOnlyRouteProps {
  redirectTo?: string;
}

export const PublicOnlyRoute = ({ redirectTo = "/" }: PublicOnlyRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
