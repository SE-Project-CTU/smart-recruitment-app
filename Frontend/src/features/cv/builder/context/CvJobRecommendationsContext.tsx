import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
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

interface CvJobRecommendationsContextValue {
  jobs: RealtimeRecommendedJobDto[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isCvEmpty: boolean;
  isCvStale: boolean;
  hasFetchedOnce: boolean;
  refresh: () => void;
  selectedJob: JobDrawerItem | null;
  isDrawerOpen: boolean;
  isLoadingDetail: boolean;
  openJobDetail: (jobItem: RealtimeRecommendedJobDto) => void;
  closeDrawer: () => void;
  triggerInitialFetch: () => void;
}

const CvJobRecommendationsContext =
  createContext<CvJobRecommendationsContextValue | null>(null);

/**
 * CvJobRecommendationsProvider:
 * Quản lý trạng thái và bộ nhớ cache danh sách việc làm gợi ý từ AI Rerank
 * ở cấp độ Form CV Builder:
 * - Lưu giữ kết quả `jobs` không bị mất khi thu gọn / mở lại sidebar
 * - Chỉ gọi API lần đầu khi người dùng mở tab
 * - Tránh lặp lại API không mong muốn gây tốn tài nguyên và giật lag giao diện
 */
export const CvJobRecommendationsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { getValues, watch } = useFormContext<RichTextCvEditorValues>();
  const rerankMutation = useRerankJobsRealtime();

  // Lưu trữ văn bản CV tại thời điểm gọi API thành công gần nhất
  const lastFetchedCvTextRef = useRef<string | null>(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  // Danh sách jobs được lưu giữ bền bỉ tại Context
  const [jobs, setJobs] = useState<RealtimeRecommendedJobDto[]>([]);

  // Trạng thái Drawer xem chi tiết việc làm
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
        const result = await rerankMutation.mutateAsync({
          cvText,
          limit: 20,
        });
        setJobs(result);
        lastFetchedCvTextRef.current = cvText;
        setHasFetchedOnce(true);
      } catch (err) {
        console.error(
          "[CvJobRecommendationsContext] Lỗi gợi ý việc làm:",
          err,
        );
      }
    },
    [getValues, rerankMutation],
  );

  /**
   * Kích hoạt gọi API chỉ khi chưa từng gọi lần nào trong phiên chỉnh sửa CV
   */
  const triggerInitialFetch = useCallback(() => {
    if (!hasFetchedOnce && !rerankMutation.isPending) {
      void fetchRecommendations(true);
    }
  }, [hasFetchedOnce, rerankMutation.isPending, fetchRecommendations]);

  /**
   * Mở chi tiết việc làm qua JobDetailDrawer
   */
  const handleOpenJobDetail = useCallback(
    async (jobItem: RealtimeRecommendedJobDto) => {
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

      try {
        setIsLoadingDetail(true);
        const fullDetail = await jobService.getJobPostingDetail(jobItem.id);
        setSelectedJob(fullDetail as unknown as JobDrawerItem);
      } catch (err) {
        console.warn(
          "[CvJobRecommendationsContext] Không thể nạp chi tiết bổ sung:",
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

  return (
    <CvJobRecommendationsContext.Provider
      value={{
        jobs,
        isLoading: rerankMutation.isPending,
        isError: rerankMutation.isError,
        errorMessage,
        isCvEmpty,
        isCvStale,
        hasFetchedOnce,
        refresh: handleRefresh,
        selectedJob,
        isDrawerOpen,
        isLoadingDetail,
        openJobDetail: handleOpenJobDetail,
        closeDrawer: handleCloseDrawer,
        triggerInitialFetch,
      }}
    >
      {children}
    </CvJobRecommendationsContext.Provider>
  );
};

export function useCvJobRecommendationsContext() {
  const context = useContext(CvJobRecommendationsContext);
  if (!context) {
    throw new Error(
      "useCvJobRecommendationsContext must be used within a CvJobRecommendationsProvider",
    );
  }
  return context;
}
