import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { ApiResponse } from "@/types";
import type {
  ApplicationStatusHistoryItem,
  ApplyJobPayload,
  CandidateMyApplicationItem,
  JobApplicationItem,
} from "@/types/application";

export interface PagedCandidateApplicationsResult {
  items: CandidateMyApplicationItem[];
  page: number;
  pageSize: number;
  totalItems: number;
}

const mapToCandidateMyApplicationItem = (
  app: JobApplicationItem,
): CandidateMyApplicationItem => {
  const job = app.job;
  return {
    id: app.id,
    jobId: app.jobId,
    job: app.job,
    jobTitle: job?.title || "Công việc tuyển dụng",
    companyId: job?.company?.id,
    companyName: job?.company?.name || "Doanh nghiệp",
    companyLogoUrl: job?.company?.logoUrl || null,
    salaryRange:
      job && job.salaryMin && job.salaryMax
        ? `${(job.salaryMin / 1000000).toFixed(0)} - ${(job.salaryMax / 1000000).toFixed(0)} triệu`
        : "Thỏa thuận",
    locationName: job?.province?.name || "",
    cvVersionId: app.cvVersionId,
    uploadedCvUrl: app.uploadedCvUrl,
    cvSnapshot: app.cvSnapshot,
    coverLetter: app.coverLetter,
    status: app.status,
    appliedAt: app.appliedAt,
    updatedAt: app.updatedAt,
  };
};

export const applicationService = {
  /**
   * Lấy danh sách các đơn ứng tuyển của Candidate hiện tại
   * Backend đã nhúng sẵn thông tin Job (job title, company, salary, location), không cần query N+1
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

    const rawData = response?.data as unknown;
    let rawList: JobApplicationItem[] = [];
    if (Array.isArray(rawData)) {
      rawList = rawData;
    } else if (
      rawData &&
      typeof rawData === "object" &&
      "items" in rawData &&
      Array.isArray((rawData as { items: unknown }).items)
    ) {
      rawList = (rawData as { items: JobApplicationItem[] }).items;
    }

    // Ghép nối thông tin hoàn chỉnh trực tiếp từ object job được backend trả về (tránh N+1 query)
    const enrichedItems: CandidateMyApplicationItem[] = rawList.map(
      mapToCandidateMyApplicationItem,
    );

    return {
      items: enrichedItems,
      page: (response.meta?.page as number) ?? 1,
      pageSize: (response.meta?.pageSize as number) ?? 20,
      totalItems:
        (response.meta?.totalItems as number) ?? rawList.length,
    };
  },

  /**
   * Xem chi tiết một đơn ứng tuyển (Backend đã nhúng sẵn Job, Candidate và CvSnapshot)
   */
  async getApplicationDetail(
    id: string,
  ): Promise<CandidateMyApplicationItem> {
    const response = await axiosClient.get<
      never,
      ApiResponse<JobApplicationItem>
    >(API_ENDPOINTS.APPLICATION.DETAIL(id));

    return mapToCandidateMyApplicationItem(response.data);
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
