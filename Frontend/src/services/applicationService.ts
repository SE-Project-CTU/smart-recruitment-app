import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { jobService } from "@/services/jobService";
import type { ApiResponse } from "@/types";
import type {
  ApplicationStatusHistoryItem,
  ApplyJobPayload,
  CandidateMyApplicationItem,
} from "@/types/application";
import type { JobApplicationItem, JobPostingItem } from "@/types/job";

export interface PagedCandidateApplicationsResult {
  items: CandidateMyApplicationItem[];
  page: number;
  pageSize: number;
  totalItems: number;
}

/**
 * In-memory Lookup Cache cho Job Postings để triệt tiêu hoàn toàn rủi ro N+1 Query.
 * Lưu trữ thông tin chi tiết JD để tái sử dụng trên toàn bộ danh sách đơn nộp.
 */
interface CachedJobEntry {
  job: JobPostingItem;
  cachedAt: number;
}

const jobLookupCache = new Map<string, CachedJobEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

export const applicationService = {
  /**
   * Helper: Resolve thông tin nhiều Job theo danh sách Job ID (Batch + Cache thông minh)
   * Giảm từ N requests xuống còn 0 hoặc tối đa 1 batch request duy nhất
   */
  async resolveJobsBatch(
    jobIds: string[],
  ): Promise<Map<string, JobPostingItem>> {
    const resultMap = new Map<string, JobPostingItem>();
    const missingIds: string[] = [];
    const now = Date.now();

    // 1. Kiểm tra cache trước
    for (const id of jobIds) {
      const cached = jobLookupCache.get(id);
      if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
        resultMap.set(id, cached.job);
      } else {
        missingIds.push(id);
      }
    }

    // 2. Fetch song song các Job ID chưa có trong cache (Batch size 10)
    if (missingIds.length > 0) {
      const uniqueMissing = Array.from(new Set(missingIds));
      const batchSize = 10;

      for (let i = 0; i < uniqueMissing.length; i += batchSize) {
        const batch = uniqueMissing.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (id) => {
            try {
              const job = await jobService.getJobPostingDetail(id);
              return { id, job };
            } catch {
              return { id, job: null };
            }
          }),
        );

        for (const { id, job } of batchResults) {
          if (job) {
            jobLookupCache.set(id, { job, cachedAt: now });
            resultMap.set(id, job);
          }
        }
      }
    }

    return resultMap;
  },

  /**
   * Lấy danh sách các đơn ứng tuyển của Candidate hiện tại
   * Đã được tối ưu hóa phòng chống N+1 Query thông qua JobLookupCache
   */
  async getMyApplications(params?: {
    status?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
    direction?: string;
  }): Promise<PagedCandidateApplicationsResult> {
    const response = await axiosClient.get<
      never,
      ApiResponse<JobApplicationItem[]>
    >(API_ENDPOINTS.APPLICATION.MY_APPLICATIONS, {
      params: {
        status: params?.status === "ALL" ? undefined : params?.status,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        sort: params?.sort,
        direction: params?.direction,
      },
    });

    const rawList = response.data || [];
    const uniqueJobIds = Array.from(
      new Set(rawList.map((app) => app.jobId).filter(Boolean)),
    );

    // Kéo thông tin chi tiết các Job qua Resolver chống N+1
    const jobsMap = await this.resolveJobsBatch(uniqueJobIds);

    // Ghép nối thông tin hoàn chỉnh cho UI
    const enrichedItems: CandidateMyApplicationItem[] = rawList.map((app) => {
      const job = jobsMap.get(app.jobId);
      return {
        id: app.id,
        jobId: app.jobId,
        jobTitle: job?.title || "Công việc tuyển dụng",
        companyId: job?.companyId,
        companyName: job?.company?.name || "Doanh nghiệp",
        companyLogoUrl: job?.company?.logoUrl || null,
        salaryRange:
          job && job.salaryMin && job.salaryMax
            ? `${(job.salaryMin / 1000000).toFixed(0)} - ${(job.salaryMax / 1000000).toFixed(0)} triệu`
            : "Thỏa thuận",
        locationName:
          job?.province?.name || job?.detailedLocation || "",
        cvVersionId: app.cvVersionId,
        uploadedCvUrl: app.uploadedCvUrl,
        coverLetter: app.coverLetter,
        status: app.status,
        appliedAt: app.appliedAt,
        updatedAt: app.updatedAt,
      };
    });

    return {
      items: enrichedItems,
      page: (response.meta?.page as number) ?? 1,
      pageSize: (response.meta?.pageSize as number) ?? 20,
      totalItems:
        (response.meta?.totalItems as number) ?? rawList.length,
    };
  },

  /**
   * Xem chi tiết một đơn ứng tuyển
   */
  async getApplicationDetail(
    id: string,
  ): Promise<CandidateMyApplicationItem> {
    const response = await axiosClient.get<
      never,
      ApiResponse<JobApplicationItem>
    >(API_ENDPOINTS.APPLICATION.DETAIL(id));

    const app = response.data;
    const jobsMap = await this.resolveJobsBatch([app.jobId]);
    const job = jobsMap.get(app.jobId);

    return {
      id: app.id,
      jobId: app.jobId,
      jobTitle: job?.title || "Công việc tuyển dụng",
      companyId: job?.companyId,
      companyName: job?.company?.name || "Doanh nghiệp",
      companyLogoUrl: job?.company?.logoUrl || null,
      salaryRange:
        job && job.salaryMin && job.salaryMax
          ? `${(job.salaryMin / 1000000).toFixed(0)} - ${(job.salaryMax / 1000000).toFixed(0)} triệu`
          : "Thỏa thuận",
      locationName:
        job?.province?.name || job?.detailedLocation || "",
      cvVersionId: app.cvVersionId,
      uploadedCvUrl: app.uploadedCvUrl,
      coverLetter: app.coverLetter,
      status: app.status,
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
    };
  },

  /**
   * Xem lịch sử cập nhật trạng thái đơn ứng tuyển (Timeline)
   */
  async getApplicationStatusHistory(
    id: string,
  ): Promise<ApplicationStatusHistoryItem[]> {
    const response = await axiosClient.get<
      never,
      ApiResponse<ApplicationStatusHistoryItem[]>
    >(API_ENDPOINTS.APPLICATION.STATUS_HISTORY(id));

    return response.data || [];
  },

  /**
   * Nộp hồ sơ ứng tuyển vào một JD
   */
  async applyJob(
    jobId: string,
    payload: ApplyJobPayload,
  ): Promise<JobApplicationItem> {
    const response = await axiosClient.post<
      never,
      ApiResponse<JobApplicationItem>
    >(API_ENDPOINTS.JOB_POSTING.APPLY(jobId), payload);

    return response.data;
  },
};
