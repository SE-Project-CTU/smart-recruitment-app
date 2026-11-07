import { useEffect } from "react";
import { useCvJobRecommendationsContext } from "../context/CvJobRecommendationsContext";

export interface UseCvJobRecommendationsOptions {
  isActive?: boolean;
}

/**
 * useCvJobRecommendations:
 * Hook cung cấp dữ liệu việc làm gợi ý từ AI cho tab SuggestedJobsTab.
 * Lấy dữ liệu từ CvJobRecommendationsContext để đảm bảo:
 * - Dữ liệu không bị reset khi đóng/mở sidebar
 * - Không tự động gọi lại API khi chỉ thao tác ẩn/hiện giao diện
 */
export function useCvJobRecommendations({
  isActive = true,
}: UseCvJobRecommendationsOptions = {}) {
  const context = useCvJobRecommendationsContext();

  useEffect(() => {
    if (isActive) {
      context.triggerInitialFetch();
    }
  }, [isActive, context]);

  return context;
}
