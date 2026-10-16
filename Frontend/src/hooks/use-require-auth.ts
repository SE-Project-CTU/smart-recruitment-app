import { useLocation, useNavigate, type Location } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

/**
 * Hook tiện ích dùng cho bất kỳ Component nào cần yêu cầu đăng nhập trước khi thực hiện hành động.
 *
 * @example
 * ```tsx
 * const { requireAuth } = useRequireAuth();
 *
 * const handleCreateCV = () => {
 *   requireAuth(() => {
 *     // Logic chỉ chạy khi đã đăng nhập
 *     navigate("/create-cv");
 *   });
 * };
 * ```
 */
export const useRequireAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  /**
   * Kiểm tra đăng nhập:
   * - Nếu ĐÃ đăng nhập: thực thi callback và trả về true.
   * - Nếu CHƯA đăng nhập: tự động chuyển hướng về /sign-in, lưu trang hiện tại vào state.from và trả về false.
   */
  const requireAuth = (
    callback?: () => void,
    customRedirectFrom?: Location | string,
  ): boolean => {
    if (!isAuthenticated) {
      navigate("/sign-in", {
        state: { from: customRedirectFrom || location },
      });
      return false;
    }

    callback?.();
    return true;
  };

  return {
    isAuthenticated,
    requireAuth,
  };
};
