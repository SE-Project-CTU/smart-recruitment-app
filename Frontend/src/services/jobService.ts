import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  ApiPagedResponse,
  ApiResponse,
  CreateJobPostingPayload,
  JobPostingItem,
  SearchJobPostingsRequest,
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
   * Xem chi tiết tin tuyển dụng
   */
  async getJobPostingDetail(id: string): Promise<JobPostingItem> {
    const response = await axiosClient.get<never, ApiResponse<JobPostingItem>>(
      API_ENDPOINTS.JOB_POSTING.DETAIL(id),
    );
    return response.data;
  },

  /**
   * Tìm kiếm và lọc danh sách tin tuyển dụng
   */
  async searchJobPostings(params?: SearchJobPostingsRequest): Promise<{
    items: JobPostingItem[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const response = await axiosClient.get<
      never,
      ApiPagedResponse<JobPostingItem>
    >(API_ENDPOINTS.JOB_POSTING.SEARCH, { params });

    return {
      items: response.data || [],
      meta: {
        page: response.meta.page,
        pageSize: response.meta.pageSize,
        totalItems: response.meta.totalItems,
        totalPages: response.meta.totalPages,
      },
    };
  },
};
