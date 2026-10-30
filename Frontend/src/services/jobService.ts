import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  ApiPagedResponse,
  ApiResponse,
  CreateJobPostingPayload,
  JobPostingDetailResult,
  JobPostingResult,
  JobPostingSearchItem,
  PaginationMeta,
  SearchJobPostingsRequest,
  UpdateJobPostingPayload,
  UpdateJobPostingStatusResult,
} from "@/types";
import type {
  JobApplicationItem,
  JobApplicationStatus,
} from "@/types/application";

export const jobService = {
  async createJobPosting(
    payload: CreateJobPostingPayload,
  ): Promise<JobPostingResult> {
    const response = await axiosClient.post<never, ApiResponse<JobPostingResult>>(
      API_ENDPOINTS.JOB_POSTING.CREATE,
      payload,
    );
    return response.data;
  },

  async getJobPostingDetail(id: string): Promise<JobPostingDetailResult> {
    const response = await axiosClient.get<
      never,
      ApiResponse<JobPostingDetailResult>
    >(API_ENDPOINTS.JOB_POSTING.DETAIL(id));
    return response.data;
  },

  async updateJobPosting(
    id: string,
    payload: UpdateJobPostingPayload,
  ): Promise<JobPostingResult> {
    const response = await axiosClient.patch<
      never,
      ApiResponse<JobPostingResult>
    >(API_ENDPOINTS.JOB_POSTING.UPDATE(id), payload);
    return response.data;
  },

  async updateJobPostingStatus(
    id: string,
    status: string,
  ): Promise<UpdateJobPostingStatusResult> {
    const response = await axiosClient.patch<
      never,
      ApiResponse<UpdateJobPostingStatusResult>
    >(API_ENDPOINTS.JOB_POSTING.UPDATE_STATUS(id), { status });
    return response.data;
  },

  async searchJobPostings(params?: SearchJobPostingsRequest): Promise<{
    items: JobPostingSearchItem[];
    meta: PaginationMeta;
  }> {
    const response = await axiosClient.get<
      never,
      ApiPagedResponse<JobPostingSearchItem>
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
