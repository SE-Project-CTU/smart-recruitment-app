import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useRerankJobsRealtime } from "@/hooks/queries/useAi";
import { jobService } from "@/services/jobService";
import { getApiErrorMessage } from "@/api/errorHandler";
import type { JobDrawerItem } from "@/components/job/JobDetailDrawer";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";
import {
  convertCvFormToPlainText,
  isCvPlainTextEmpty,
} from "../utils/cvAssistantHelpers";
import type { RealtimeRecommendedJobDto } from "@/types/ai";

export interface UseCvJobRecommendationsOptions {
  isActive: boolean;
}

export function useCvJobRecommendations({
  isActive,
}: UseCvJobRecommendationsOptions) {
  const { getValues, watch } = useFormContext<RichTextCvEditorValues>();

  const rerankMutation = useRerankJobsRealtime();

  // Lưu trữ văn bản CV tại thời điểm gọi API thành công gần nhất
  const lastFetchedCvTextRef = useRef<string | null>(null);
  const hasTriggeredInitialFetch = useRef(false);

  // Trạng thái việc làm và Drawer xem chi tiết
  const [selectedJob, setSelectedJob] = useState<JobDrawerItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Theo dõi giá trị form để phát hiện thay đổi sau lần gọi API (stale state)
  const watchedValues = watch();
  const currentCvText = convertCvFormToPlainText(watchedValues);
  const isCvEmpty = isCvPlainTextEmpty(currentCvText);

  // CV bị cũ nếu văn bản hiện tại khác với văn bản lúc gọi API gần nhất
  const isCvStale =
    Boolean(lastFetchedCvTextRef.current) &&
    lastFetchedCvTextRef.current !== currentCvText;

  /**
   * Gọi API rerank việc làm dựa trên nội dung CV hiện tại
   */
  const fetchRecommendations = useCallback(
    async (force = false) => {
      const formValues = getValues();
      const cvText = convertCvFormToPlainText(formValues);

      if (isCvPlainTextEmpty(cvText)) {
        lastFetchedCvTextRef.current = null;
        return;
      }

      // Tránh gọi lặp lại cùng một nội dung nếu không phải force refresh
      if (!force && lastFetchedCvTextRef.current === cvText) {
        return;
      }

      try {
        await rerankMutation.mutateAsync({
          cvText,
          limit: 20,
        });
        lastFetchedCvTextRef.current = cvText;
      } catch (err) {
        console.error("[useCvJobRecommendations] Lỗi gợi ý việc làm:", err);
      }
    },
    [getValues, rerankMutation],
  );

  /**
   * Kích hoạt gọi API khi người dùng mở tab lần đầu tiên
   */
  useEffect(() => {
    if (isActive && !hasTriggeredInitialFetch.current) {
      hasTriggeredInitialFetch.current = true;
      void fetchRecommendations(true);
    }
  }, [isActive, fetchRecommendations]);

  /**
   * Mở chi tiết việc làm qua JobDetailDrawer
   */
  const handleOpenJobDetail = useCallback(
    async (jobItem: RealtimeRecommendedJobDto) => {
      // Thiết lập hiển thị ngay thông tin cơ bản để drawer mở mượt mà
      setSelectedJob({
        id: jobItem.id,
        title: jobItem.title,
        company: {
          id: "",
          name: jobItem.companyName,
          logoUrl: jobItem.logoUrl || null,
          logoFileUrl: jobItem.logoUrl || null,
        },
        salaryMin: jobItem.salaryMin ?? null,
        salaryMax: jobItem.salaryMax ?? null,
        salaryNegotiable: !jobItem.salaryMin && !jobItem.salaryMax,
        location: {
          provinceName: jobItem.location,
          addressDetail: jobItem.location,
        },
        requirements: jobItem.requirements,
      } as unknown as JobDrawerItem);
      setIsDrawerOpen(true);

      // Nạp chi tiết đầy đủ từ BE qua jobService
      try {
        setIsLoadingDetail(true);
        const fullDetail = await jobService.getJobPostingDetail(jobItem.id);
        setSelectedJob(fullDetail as unknown as JobDrawerItem);
      } catch (err) {
        console.warn(
          "[useCvJobRecommendations] Không thể nạp chi tiết bổ sung:",
          err,
        );
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedJob(null);
  }, []);

  const handleRefresh = useCallback(() => {
    void fetchRecommendations(true);
  }, [fetchRecommendations]);

  const errorMessage = rerankMutation.error
    ? getApiErrorMessage(
        rerankMutation.error,
        "Không thể lấy danh sách việc làm gợi ý lúc này. Vui lòng thử lại sau.",
      )
    : null;

  return {
    jobs: rerankMutation.data ?? [],
    isLoading: rerankMutation.isPending,
    isError: rerankMutation.isError,
    errorMessage,
    isCvEmpty,
    isCvStale,
    refresh: handleRefresh,
    // Drawer states
    selectedJob,
    isDrawerOpen,
    isLoadingDetail,
    openJobDetail: handleOpenJobDetail,
    closeDrawer: handleCloseDrawer,
  };
}
