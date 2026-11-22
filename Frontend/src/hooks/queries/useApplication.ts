import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { applicationService } from "@/services/applicationService";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/api/errorHandler";
import type { ApplyJobPayload } from "@/types/application";

/**
 * Hook Query: Lấy danh sách các đơn ứng tuyển của Candidate
 * Dữ liệu đã tự động tích hợp Job & Company info và phòng chống N+1 Query
 */
export const useMyApplications = (
  params?: {
    status?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
    direction?: string;
  },
  options?: { enabled?: boolean },
) => {
  const user = useAuthStore((state) => state.user);
  const isCandidate = Boolean(
    user?.roles?.some((role) => role.toLowerCase() === "candidate"),
  );

  return useQuery({
    queryKey: ["applications", "my", user?.id, params],
    queryFn: () => applicationService.getMyApplications(params),
    enabled: Boolean(user?.id) && isCandidate && (options?.enabled ?? true),
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
 * Hook Query: Lấy toàn bộ ID các tin ứng tuyển mà Candidate đã nộp (dưới dạng Set để tra cứu O(1))
 */
export const useMyAppliedJobIds = (options?: { enabled?: boolean }) => {
  const user = useAuthStore((state) => state.user);
  const isCandidate = Boolean(
    user?.roles?.some((role) => role.toLowerCase() === "candidate"),
  );

  return useQuery({
    queryKey: ["applications", "my-applied-job-ids", user?.id],
    queryFn: async () => {
      const res = await applicationService.getMyApplications({
        page: 1,
        pageSize: 100,
      });
      return new Set<string>((res?.items ?? []).map((app) => app.jobId));
    },
    enabled: Boolean(user?.id) && isCandidate && (options?.enabled ?? true),
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
      queryClient.invalidateQueries({
        queryKey: ["applications", "my-applied-job-ids"],
      });
      // Invalidate chi tiết JD và applications của JD đó
      queryClient.invalidateQueries({
        queryKey: ["job-postings", "detail", variables.jobId],
      });
      toast.success({
        description: "Ứng tuyển thành công! Hồ sơ của bạn đã được gửi tới nhà tuyển dụng.",
      });
    },
    onError: (err: unknown) => {
      const message = getApiErrorMessage(
        err,
        "Nộp hồ sơ ứng tuyển thất bại",
      );
      toast.error({ description: message });
    },
  });
};

/**
 * Hook Mutation: Ứng viên rút đơn ứng tuyển
 */
export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      reason,
    }: {
      applicationId: string;
      reason?: string;
    }) => applicationService.withdrawApplication(applicationId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["applications", "my"] });
      queryClient.invalidateQueries({
        queryKey: ["applications", "my-applied-job-ids"],
      });
      queryClient.invalidateQueries({
        queryKey: ["applications", "detail", variables.applicationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["applications", "history", variables.applicationId],
      });
      toast.success({
        description: "Rút hồ sơ ứng tuyển thành công.",
      });
    },
    onError: (err: unknown) => {
      const message = getApiErrorMessage(
        err,
        "Không thể rút hồ sơ ứng tuyển. Vui lòng thử lại.",
      );
      toast.error({ description: message });
    },
  });
};
