import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/services/jobService";
import type { CreateJobPostingPayload } from "@/types";

/**
 * Hook Mutation: Tạo tin tuyển dụng mới
 */
export const useCreateJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJobPostingPayload) =>
      jobService.createJobPosting(payload),
    onSuccess: () => {
      // Làm mới danh sách tin tuyển dụng
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
    },
  });
};

/**
 * Hook Query: Xem chi tiết tin tuyển dụng
 */
export const useJobPostingDetail = (id?: string) => {
  return useQuery({
    queryKey: ["job-postings", "detail", id],
    queryFn: () => jobService.getJobPostingDetail(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
};
