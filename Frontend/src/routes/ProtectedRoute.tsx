import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { PATHS } from "@/constants/paths";

export const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // Lưu lại toàn bộ route (pathname + search params) mà user muốn vào
    return (
      <Navigate to={PATHS.SIGN_IN} state={{ from: location }} replace />
    );
  }

  return <Outlet />;
};
