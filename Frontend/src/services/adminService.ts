import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { ApiResponse, ApiPagedResponse } from "@/types/common";
import type {
  AdminDashboardOverviewData,
  AdminUserItem,
  AdminUserFilterParams,
  UpdateUserStatusPayload,
  UpdateUserStatusResult,
  AdminCompanyItem,
  AdminCompanyDetail,
  AdminCompanyFilterParams,
  ReviewCompanyVerificationPayload,
  ReviewCompanyVerificationResult,
  AdminJobPostingItem,
  AdminJobPostingFilterParams,
  ReviewJobModerationPayload,
  ReviewJobModerationResult,
  AdminIndustryGroup,
  AdminIndustry,
  AdminProvince,
  AdminWard,
  AdminSkill,
  AdminCvTemplateItem,
  AdminPagedResponse,
} from "@/types/admin";

export const adminService = {
  // ==========================================
  // 1. DASHBOARD
  // ==========================================
  async getDashboardOverview(params?: {
    from?: string;
    to?: string;
  }): Promise<AdminDashboardOverviewData> {
    const res = await axiosClient.get<
      never,
      ApiResponse<AdminDashboardOverviewData>
    >(API_ENDPOINTS.ADMIN.DASHBOARD_OVERVIEW, { params });
    return res.data;
  },

  // ==========================================
  // 2. USERS
  // ==========================================
  async getUsers(
    params?: AdminUserFilterParams,
  ): Promise<AdminPagedResponse<AdminUserItem>> {
    const res = await axiosClient.get<
      never,
      ApiPagedResponse<AdminUserItem>
    >(API_ENDPOINTS.ADMIN.USERS, { params });
    return {
      data: res.data,
      meta: res.meta,
    };
  },

  async updateUserStatus(
    id: string,
    payload: UpdateUserStatusPayload,
  ): Promise<UpdateUserStatusResult> {
    const res = await axiosClient.patch<
      never,
      ApiResponse<UpdateUserStatusResult>
    >(API_ENDPOINTS.ADMIN.USER_STATUS(id), payload);
    return res.data;
  },

  // ==========================================
  // 3. COMPANIES
  // ==========================================
  async getCompanies(
    params?: AdminCompanyFilterParams,
  ): Promise<AdminPagedResponse<AdminCompanyItem>> {
    const res = await axiosClient.get<
      never,
      ApiPagedResponse<AdminCompanyItem>
    >(API_ENDPOINTS.ADMIN.COMPANIES, { params });
    return {
      data: res.data,
      meta: res.meta,
    };
  },

  async getCompanyDetail(id: string): Promise<AdminCompanyDetail> {
    const res = await axiosClient.get<never, ApiResponse<AdminCompanyDetail>>(
      API_ENDPOINTS.ADMIN.COMPANY_DETAIL(id),
    );
    return res.data;
  },

  async reviewCompanyVerification(
    id: string,
    payload: ReviewCompanyVerificationPayload,
  ): Promise<ReviewCompanyVerificationResult> {
    const res = await axiosClient.patch<
      never,
      ApiResponse<ReviewCompanyVerificationResult>
    >(API_ENDPOINTS.ADMIN.COMPANY_VERIFICATION(id), payload);
    return res.data;
  },

  // ==========================================
  // 4. JOB POSTINGS
  // ==========================================
  async getJobPostings(
    params?: AdminJobPostingFilterParams,
  ): Promise<AdminPagedResponse<AdminJobPostingItem>> {
    const res = await axiosClient.get<
      never,
      ApiPagedResponse<AdminJobPostingItem>
    >(API_ENDPOINTS.ADMIN.JOB_POSTINGS, { params });
    return {
      data: res.data,
      meta: res.meta,
    };
  },

  async getJobPostingDetail(id: string): Promise<Record<string, unknown>> {
    const res = await axiosClient.get<
      never,
      ApiResponse<Record<string, unknown>>
    >(API_ENDPOINTS.ADMIN.JOB_POSTING_DETAIL(id));
    return res.data;
  },

  async reviewJobModeration(
    id: string,
    payload: ReviewJobModerationPayload,
  ): Promise<ReviewJobModerationResult> {
    const res = await axiosClient.patch<
      never,
      ApiResponse<ReviewJobModerationResult>
    >(API_ENDPOINTS.ADMIN.JOB_POSTING_MODERATION(id), payload);
    return res.data;
  },

  // ==========================================
  // 5. MASTER CATALOGS
  // ==========================================
  async getIndustryGroups(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<AdminPagedResponse<AdminIndustryGroup>> {
    const res = await axiosClient.get<
      never,
      ApiPagedResponse<AdminIndustryGroup>
    >(API_ENDPOINTS.ADMIN.INDUSTRY_GROUPS, { params });
    return {
      data: res.data,
      meta: res.meta,
    };
  },

  async createIndustryGroup(payload: {
    name: string;
  }): Promise<AdminIndustryGroup> {
    const res = await axiosClient.post<never, ApiResponse<AdminIndustryGroup>>(
      API_ENDPOINTS.ADMIN.INDUSTRY_GROUPS,
      payload,
    );
    return res.data;
  },

  async updateIndustryGroup(
    id: string,
    payload: { name?: string; isActive?: boolean },
  ): Promise<AdminIndustryGroup> {
    const res = await axiosClient.patch<never, ApiResponse<AdminIndustryGroup>>(
      API_ENDPOINTS.ADMIN.INDUSTRY_GROUP_DETAIL(id),
      payload,
    );
    return res.data;
  },

  async getIndustries(params?: {
    groupId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AdminPagedResponse<AdminIndustry>> {
    const res = await axiosClient.get<never, ApiPagedResponse<AdminIndustry>>(
      API_ENDPOINTS.ADMIN.INDUSTRIES,
      { params },
    );
    return {
      data: res.data,
      meta: res.meta,
    };
  },

  async createIndustry(payload: {
    groupId: string;
    name: string;
  }): Promise<AdminIndustry> {
    const res = await axiosClient.post<never, ApiResponse<AdminIndustry>>(
      API_ENDPOINTS.ADMIN.INDUSTRIES,
      payload,
    );
    return res.data;
  },

  async updateIndustry(
    id: string,
    payload: { groupId?: string; name?: string; isActive?: boolean },
  ): Promise<AdminIndustry> {
    const res = await axiosClient.patch<never, ApiResponse<AdminIndustry>>(
      API_ENDPOINTS.ADMIN.INDUSTRY_DETAIL(id),
      payload,
    );
    return res.data;
  },

  async getProvinces(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<AdminPagedResponse<AdminProvince>> {
    const res = await axiosClient.get<never, ApiPagedResponse<AdminProvince>>(
      API_ENDPOINTS.ADMIN.PROVINCES,
      { params },
    );
    return {
      data: res.data,
      meta: res.meta,
    };
  },

  async createProvince(payload: {
    name: string;
    status?: string;
    isCentrallyGoverned?: boolean;
  }): Promise<AdminProvince> {
    const res = await axiosClient.post<never, ApiResponse<AdminProvince>>(
      API_ENDPOINTS.ADMIN.PROVINCES,
      payload,
    );
    return res.data;
  },

  async updateProvince(
    id: string,
    payload: {
      name?: string;
      status?: string;
      isCentrallyGoverned?: boolean;
    },
  ): Promise<AdminProvince> {
    const res = await axiosClient.patch<never, ApiResponse<AdminProvince>>(
      API_ENDPOINTS.ADMIN.PROVINCE_DETAIL(id),
      payload,
    );
    return res.data;
  },

  async getWards(params?: {
    provinceId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AdminPagedResponse<AdminWard>> {
    const res = await axiosClient.get<never, ApiPagedResponse<AdminWard>>(
      API_ENDPOINTS.ADMIN.WARDS,
      { params },
    );
    return {
      data: res.data,
      meta: res.meta,
    };
  },

  async createWard(payload: {
    provinceId: string;
    name: string;
    status?: string;
    isCommune?: boolean;
  }): Promise<AdminWard> {
    const res = await axiosClient.post<never, ApiResponse<AdminWard>>(
      API_ENDPOINTS.ADMIN.WARDS,
      payload,
    );
    return res.data;
  },

  async updateWard(
    id: string,
    payload: {
      provinceId?: string;
      name?: string;
      status?: string;
      isCommune?: boolean;
    },
  ): Promise<AdminWard> {
    const res = await axiosClient.patch<never, ApiResponse<AdminWard>>(
      API_ENDPOINTS.ADMIN.WARD_DETAIL(id),
      payload,
    );
    return res.data;
  },

  async getSkills(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<AdminPagedResponse<AdminSkill>> {
    const res = await axiosClient.get<never, ApiPagedResponse<AdminSkill>>(
      API_ENDPOINTS.ADMIN.SKILLS,
      { params },
    );
    return {
      data: res.data,
      meta: res.meta,
    };
  },

  async createSkill(payload: { name: string }): Promise<AdminSkill> {
    const res = await axiosClient.post<never, ApiResponse<AdminSkill>>(
      API_ENDPOINTS.ADMIN.SKILLS,
      payload,
    );
    return res.data;
  },

  async updateSkill(
    id: string,
    payload: { name?: string; isActive?: boolean },
  ): Promise<AdminSkill> {
    const res = await axiosClient.patch<never, ApiResponse<AdminSkill>>(
      API_ENDPOINTS.ADMIN.SKILL_DETAIL(id),
      payload,
    );
    return res.data;
  },

  async getCvTemplates(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<AdminPagedResponse<AdminCvTemplateItem>> {
    const res = await axiosClient.get<
      never,
      ApiPagedResponse<AdminCvTemplateItem>
    >(API_ENDPOINTS.ADMIN.CV_TEMPLATES, { params });
    return {
      data: res.data,
      meta: res.meta,
    };
  },

  async updateCvTemplate(
    id: string,
    payload: {
      name?: string;
      description?: string;
      isActive?: boolean;
    },
  ): Promise<Record<string, unknown>> {
    const res = await axiosClient.patch<
      never,
      ApiResponse<Record<string, unknown>>
    >(API_ENDPOINTS.ADMIN.CV_TEMPLATE_DETAIL(id), payload);
    return res.data;
  },
};

