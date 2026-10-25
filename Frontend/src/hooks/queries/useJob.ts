import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/services/jobService";
import { companyService } from "@/services/companyService";
import type {
  CreateJobPostingPayload,
  JobApplicationItem,
  JobApplicationStatus,
  JobPostingItem,
  RecruiterCandidateApplicationItem,
  SearchJobPostingsRequest,
  UpdateJobPostingPayload,
} from "@/types";
import { toast } from "../use-toast";

/**
 * Hook Query: Danh sách tin tuyển dụng Public (API 5)
 */
export const useJobPostings = (params?: SearchJobPostingsRequest) => {
  return useQuery({
    queryKey: ["job-postings", "list", params],
    queryFn: () => jobService.searchJobPostings(params),
    staleTime: 60 * 1000,
  });
};

/**
 * Hook Query: Danh sách tin tuyển dụng cho Recruiter từ các công ty của họ (API 15)
 * Hỗ trợ truyền danh sách ID công ty để lấy dữ liệu đồng thời (Promise.all)
 */
export const useRecruiterJobPostings = (companyIds: string[]) => {
  return useQuery({
    queryKey: ["job-postings", "recruiter-list", companyIds],
    queryFn: async () => {
      if (!companyIds || companyIds.length === 0) {
        return { items: [], totalCount: 0 };
      }
      const results = await Promise.all(
        companyIds.map((id) =>
          companyService.getCompanyJobPostings(id, { pageSize: 100 }).catch(() => ({
            items: [],
            totalCount: 0,
          }))
        )
      );

      const allItems = results.flatMap((r) => r.items);
      allItems.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        items: allItems,
        totalCount: allItems.length,
      };
    },
    enabled: companyIds.length > 0,
    staleTime: 30 * 1000,
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
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["job-postings", "applications", jobId, params],
    queryFn: () => jobService.getJobApplications(jobId!, params),
    enabled: Boolean(jobId) && (options?.enabled ?? true),
    staleTime: 30 * 1000,
  });
};

/**
 * Hook Query: Lấy toàn bộ hồ sơ ứng tuyển thuộc quyền quản lý của Recruiter (từ các JD của họ)
 */
export const useRecruiterAllApplications = (jobs: JobPostingItem[]) => {
  const jobIds = jobs.map((j) => j.id);

  return useQuery({
    queryKey: ["recruiter", "all-applications", jobIds],
    queryFn: async (): Promise<RecruiterCandidateApplicationItem[]> => {
      if (jobs.length === 0) return [];

      const results = await Promise.all(
        jobs.map((job) =>
          jobService
            .getJobApplications(job.id, { pageSize: 100 })
            .then((res) => ({
              job,
              items: res.items,
            }))
            .catch(() => ({
              job,
              items: [] as JobApplicationItem[],
            })),
        ),
      );

      const allApps: RecruiterCandidateApplicationItem[] = [];
      for (const res of results) {
        for (const app of res.items) {
          allApps.push({
            ...app,
            jobTitle: res.job.title,
            companyId: res.job.companyId,
            companyName: res.job.company?.name || "Doanh nghiệp",
          });
        }
      }

      // Sắp xếp mặc định: mới nhất lên đầu
      allApps.sort(
        (a, b) =>
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
      );

      return allApps;
    },
    enabled: jobs.length > 0,
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
      note,
    }: {
      applicationId: string;
      status: JobApplicationStatus | string;
      note?: string;
    }) => jobService.updateApplicationStatus(applicationId, status, note),
    onSuccess: () => {
      if (jobId) {
        queryClient.invalidateQueries({
          queryKey: ["job-postings", "applications", jobId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["recruiter", "all-applications"],
      });
      toast.success({ description: "Cập nhật trạng thái hồ sơ thành công" });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ||
        "Cập nhật trạng thái hồ sơ thất bại";
      toast.warning({ description: message });
    },
  });
};
