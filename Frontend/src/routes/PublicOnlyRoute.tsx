import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface PublicOnlyRouteProps {
  redirectTo?: string;
}

export const PublicOnlyRoute = ({ redirectTo = "/" }: PublicOnlyRouteProps) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    // Nếu user đã đăng nhập mà vẫn cố vào trang public (vd: /sign-in), ưu tiên điều hướng về trang họ muốn đến
    const from =
      (location.state as { from?: Location | string } | null)?.from ||
      redirectTo;
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};
