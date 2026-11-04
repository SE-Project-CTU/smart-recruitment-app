import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { PATHS } from "@/constants/paths";
import { LoadingScreen } from "@/components/common";

interface PublicOnlyRouteProps {
  redirectTo?: string;
}

export const PublicOnlyRoute = ({
  redirectTo = PATHS.HOME,
}: PublicOnlyRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, isInitializing } = useAuthStore();

  // Đang kiểm tra phiên làm việc khi F5 -> Chờ kết quả, không render form đăng nhập vội
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <LoadingScreen />
      </div>
    );
  }

  if (isAuthenticated) {
    // Nếu user đã đăng nhập mà vẫn cố vào trang public (vd: /sign-in), ưu tiên điều hướng về trang họ muốn đến
    const from =
      (location.state as { from?: Location | string } | null)?.from ||
      redirectTo;
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};
