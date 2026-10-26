import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { applicationService } from "@/services/applicationService";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";
import type { ApplyJobPayload } from "@/types/application";

/**
 * Hook Query: Lấy danh sách các đơn ứng tuyển của Candidate
 * Dữ liệu đã tự động tích hợp Job & Company info và phòng chống N+1 Query
 */
export const useMyApplications = (params?: {
  status?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  direction?: string;
}) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["applications", "my", user?.id, params],
    queryFn: () => applicationService.getMyApplications(params),
    enabled: Boolean(user?.id),
    staleTime: 60 * 1000, // 1 phút
  });
};

/**
 * Hook Query: Xem chi tiết một đơn ứng tuyển
 */
export const useApplicationDetail = (applicationId?: string) => {
  return useQuery({
    queryKey: ["applications", "detail", applicationId],
    queryFn: () => applicationService.getApplicationDetail(applicationId!),
    enabled: Boolean(applicationId),
    staleTime: 60 * 1000,
  });
};

/**
 * Hook Query: Lấy lịch sử tiến trình cập nhật trạng thái đơn ứng tuyển (Timeline)
 */
export const useApplicationStatusHistory = (applicationId?: string) => {
  return useQuery({
    queryKey: ["applications", "history", applicationId],
    queryFn: () =>
      applicationService.getApplicationStatusHistory(applicationId!),
    enabled: Boolean(applicationId),
    staleTime: 60 * 1000,
  });
};

/**
 * Hook Mutation: Nộp đơn ứng tuyển vào một JD
 */
export const useApplyJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      payload,
    }: {
      jobId: string;
      payload: ApplyJobPayload;
    }) => applicationService.applyJob(jobId, payload),
    onSuccess: (_, variables) => {
      // Invalidate danh sách đơn nộp của candidate
      queryClient.invalidateQueries({ queryKey: ["applications", "my"] });
      // Invalidate chi tiết JD và applications của JD đó
      queryClient.invalidateQueries({
        queryKey: ["job-postings", "detail", variables.jobId],
      });
      toast.success({
        description: "Ứng tuyển thành công! Hồ sơ của bạn đã được gửi tới nhà tuyển dụng.",
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || "Nộp hồ sơ ứng tuyển thất bại";
      toast.warning({ description: message });
    },
  });
};
