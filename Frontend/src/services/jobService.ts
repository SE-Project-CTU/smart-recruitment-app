import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  ApiPagedResponse,
  ApiResponse,
  CreateJobPostingPayload,
  JobApplicationItem,
  JobApplicationStatus,
  JobPostingItem,
  PaginationMeta,
  SearchJobPostingsRequest,
  UpdateJobPostingPayload,
} from "@/types";

export const jobService = {
  /**
   * Tạo tin tuyển dụng mới (Role: Recruiter, công ty đã Verified)
   */
  async createJobPosting(
    payload: CreateJobPostingPayload,
  ): Promise<JobPostingItem> {
    const response = await axiosClient.post<never, ApiResponse<JobPostingItem>>(
      API_ENDPOINTS.JOB_POSTING.CREATE,
      payload,
    );
    return response.data;
  },

  /**
   * Xem chi tiết tin tuyển dụng (API 6)
   */
  async getJobPostingDetail(id: string): Promise<JobPostingItem> {
    const response = await axiosClient.get<never, ApiResponse<JobPostingItem>>(
      API_ENDPOINTS.JOB_POSTING.DETAIL(id),
    );
    return response.data;
  },

  /**
   * Cập nhật thông tin tin tuyển dụng (API 7)
   */
  async updateJobPosting(
    id: string,
    payload: UpdateJobPostingPayload,
  ): Promise<JobPostingItem> {
    const response = await axiosClient.patch<
      never,
      ApiResponse<JobPostingItem>
    >(API_ENDPOINTS.JOB_POSTING.UPDATE(id), payload);
    return response.data;
  },

  /**
   * Cập nhật trạng thái tin tuyển dụng (API 8 - Recruiter đóng tin: CLOSED)
   */
  async updateJobPostingStatus(
    id: string,
    status: string,
  ): Promise<{ id: string; status: string; updatedAt: string }> {
    const response = await axiosClient.patch<
      never,
      ApiResponse<{ id: string; status: string; updatedAt: string }>
    >(API_ENDPOINTS.JOB_POSTING.UPDATE_STATUS(id), { status });
    return response.data;
  },

  /**
   * Tìm kiếm và lọc danh sách tin tuyển dụng (API 5)
   */
  async searchJobPostings(params?: SearchJobPostingsRequest): Promise<{
    items: JobPostingItem[];
    meta: PaginationMeta;
  }> {
    const response = await axiosClient.get<
      never,
      ApiPagedResponse<JobPostingItem>
    >(API_ENDPOINTS.JOB_POSTING.SEARCH, { params });

    return {
      items: response.data || [],
      meta: {
        page: response.meta?.page ?? 1,
        pageSize: response.meta?.pageSize ?? 20,
        totalItems: response.meta?.totalItems ?? 0,
        totalPages: response.meta?.totalPages ?? 1,
        hasNextPage: response.meta?.hasNextPage ?? false,
        hasPreviousPage: response.meta?.hasPreviousPage ?? false,
      },
    };
  },

  /**
   * Danh sách hồ sơ ứng tuyển theo tin tuyển dụng (API 11)
   */
  async getJobApplications(
    jobId: string,
    params?: {
      status?: string;
      page?: number;
      pageSize?: number;
      sort?: string;
      direction?: string;
    },
  ): Promise<{
    items: JobApplicationItem[];
    meta: PaginationMeta;
  }> {
    const response = await axiosClient.get<
      never,
      ApiPagedResponse<JobApplicationItem>
    >(API_ENDPOINTS.JOB_POSTING.APPLICATIONS(jobId), { params });

    return {
      items: response.data || [],
      meta: {
        page: response.meta?.page ?? 1,
        pageSize: response.meta?.pageSize ?? 20,
        totalItems: response.meta?.totalItems ?? 0,
        totalPages: response.meta?.totalPages ?? 1,
        hasNextPage: response.meta?.hasNextPage ?? false,
        hasPreviousPage: response.meta?.hasPreviousPage ?? false,
      },
    };
  },

  /**
   * Cập nhật trạng thái hồ sơ ứng tuyển (API 13)
   */
  async updateApplicationStatus(
    applicationId: string,
    status: JobApplicationStatus | string,
    note?: string,
  ): Promise<{ id: string; status: string; updatedAt: string }> {
    const response = await axiosClient.patch<
      never,
      ApiResponse<{ id: string; status: string; updatedAt: string }>
    >(API_ENDPOINTS.APPLICATION.UPDATE_STATUS(applicationId), {
      status,
      ...(note?.trim() ? { note: note.trim() } : {}),
    });
    return response.data;
  },
};

