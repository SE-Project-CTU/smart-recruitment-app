import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/services/jobService";
import type {
  CreateJobPostingPayload,
  JobApplicationStatus,
  SearchJobPostingsRequest,
  UpdateJobPostingPayload,
} from "@/types";

/**
 * Hook Query: Danh sách tin tuyển dụng (API 5)
 */
export const useJobPostings = (params?: SearchJobPostingsRequest) => {
  return useQuery({
    queryKey: ["job-postings", "list", params],
    queryFn: () => jobService.searchJobPostings(params),
    staleTime: 60 * 1000,
  });
};

/**
 * Hook Mutation: Tạo tin tuyển dụng mới (API 4)
 */
export const useCreateJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJobPostingPayload) =>
      jobService.createJobPosting(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
    },
  });
};

/**
 * Hook Query: Xem chi tiết tin tuyển dụng (API 6)
 */
export const useJobPostingDetail = (id?: string) => {
  return useQuery({
    queryKey: ["job-postings", "detail", id],
    queryFn: () => jobService.getJobPostingDetail(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook Mutation: Cập nhật nội dung tin tuyển dụng (API 7)
 */
export const useUpdateJobPosting = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      payload,
    }: {
      jobId: string;
      payload: UpdateJobPostingPayload;
    }) => jobService.updateJobPosting(jobId, payload),
    onSuccess: (_, variables) => {
      const targetId = id || variables.jobId;
      queryClient.invalidateQueries({
        queryKey: ["job-postings", "detail", targetId],
      });
      queryClient.invalidateQueries({ queryKey: ["job-postings", "list"] });
    },
  });
};

/**
 * Hook Mutation: Đổi trạng thái tin tuyển dụng (API 8)
 */
export const useUpdateJobPostingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: string }) =>
      jobService.updateJobPostingStatus(jobId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["job-postings", "detail", variables.jobId],
      });
      queryClient.invalidateQueries({ queryKey: ["job-postings", "list"] });
    },
  });
};

/**
 * Hook Query: Danh sách hồ sơ ứng tuyển theo JD (API 11)
 */
export const useJobApplications = (
  jobId?: string,
  params?: {
    status?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
    direction?: string;
  },
) => {
  return useQuery({
    queryKey: ["job-postings", "applications", jobId, params],
    queryFn: () => jobService.getJobApplications(jobId!, params),
    enabled: Boolean(jobId),
    staleTime: 30 * 1000,
  });
};

/**
 * Hook Mutation: Cập nhật trạng thái đơn ứng tuyển (API 13)
 */
export const useUpdateApplicationStatus = (jobId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: JobApplicationStatus | string;
    }) => jobService.updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      if (jobId) {
        queryClient.invalidateQueries({
          queryKey: ["job-postings", "applications", jobId],
        });
      }
    },
  });
};

