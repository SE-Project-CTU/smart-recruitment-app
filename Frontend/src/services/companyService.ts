import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  AcceptInvitationResult,
  ApiPagedResponse,
  ApiResponse,
  CompanyInvitationItem,
  CompanyItem,
  CompanyJoinRequestItem,
  CompanyMember,
  CreateCompanyPayload,
  InviteRecruiterPayload,
  ReviewJoinRequestPayload,
  ReviewJoinRequestResult,
  UpdateCompanyPayload,
  CompanyApplicationFilterParams,
  CompanyApplicationListItem,
  FollowedCompanyItem,
  LeaveCompanyResult,
} from "@/types";
import type { JobPostingItem } from "@/types/job";
import {
  addStoredMyCompanyId,
  clearStoredMyCompanyCache,
  getCurrentUserId,
  getStoredMyCompanyIds,
  getStoredScanTimestamp,
  saveStoredMyCompanyIds,
  saveStoredScanTimestamp,
} from "./companyMembershipCache";

type PublicCompanyParams = {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

const fetchPublicCompaniesPage = async (
  params: Required<Pick<PublicCompanyParams, "page" | "pageSize">> &
    Pick<PublicCompanyParams, "search" | "status">,
) =>
  axiosClient.get<never, ApiPagedResponse<CompanyItem>>(
    API_ENDPOINTS.COMPANY.LIST,
    { params },
  );

const getAllPublicCompanyIds = async (): Promise<string[]> => {
  const pageSize = 100;
  const firstPage = await fetchPublicCompaniesPage({ page: 1, pageSize });
  const ids = (firstPage.data ?? []).map((company) => company.id);
  const totalPages = Math.max(1, firstPage.meta.totalPages);
  const pageBatchSize = 5;

  for (let startPage = 2; startPage <= totalPages; startPage += pageBatchSize) {
    const pageNumbers = Array.from(
      { length: Math.min(pageBatchSize, totalPages - startPage + 1) },
      (_, index) => startPage + index,
    );
    const pages = await Promise.all(
      pageNumbers.map((page) => fetchPublicCompaniesPage({ page, pageSize })),
    );
    ids.push(...pages.flatMap((page) => page.data.map((company) => company.id)));
  }

  return ids;
};

export const companyService = {
  /**
   * Xóa cache danh sách ID công ty đã lưu của user hiện tại
   */
  clearMyCompaniesCache(): void {
    clearStoredMyCompanyCache();
  },

  /**
   * Lấy danh sách các công ty mà Recruiter hiện tại thực sự thuộc về (Active membership)
   * Sử dụng endpoint trực tiếp /api/v1/me/companies (1 request duy nhất)
   */
  async getMyCompanies(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<CompanyItem[]> {
    const response = await axiosClient.get<
      never,
      ApiPagedResponse<CompanyItem>
    >(API_ENDPOINTS.COMPANY.MY_COMPANIES, {
      params: {
        search: params?.search,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 100,
      },
    });

    const items = response.data || [];
    if (items.length > 0 && typeof window !== "undefined") {
      const activeCompanyId = localStorage.getItem("sr_active_company_id");
      if (!activeCompanyId || !items.some((c) => c.id === activeCompanyId)) {
        localStorage.setItem("sr_active_company_id", items[0].id);
      }
    }
    return items;
  },

  /**
   * Lấy danh sách tất cả các công ty công khai (dùng cho map dữ liệu, tránh N+1 query)
   */
  async getPublicCompanies(params?: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<CompanyItem[]> {
    const response = await fetchPublicCompaniesPage({
      page: 1,
      pageSize: 100,
      ...params,
    });
    return response.data ?? [];
  },

  /**
   * Xem thông tin chi tiết của 1 công ty theo ID (có membership của caller)
   */
  async getCompanyDetail(id: string): Promise<CompanyItem> {
    const response = await axiosClient.get<never, ApiResponse<CompanyItem>>(
      API_ENDPOINTS.COMPANY.DETAIL(id),
    );
    return response.data;
  },

  /**
   * Tạo hồ sơ doanh nghiệp mới (người tạo tự động làm Owner)
   */
  async createCompany(payload: CreateCompanyPayload): Promise<CompanyItem> {
    const response = await axiosClient.post<never, ApiResponse<CompanyItem>>(
      API_ENDPOINTS.COMPANY.CREATE,
      payload,
    );
    if (response.data?.id) {
      addStoredMyCompanyId(response.data.id);
    }
    return response.data;
  },

  /**
   * Cập nhật thông tin doanh nghiệp (Chỉ Chủ sở hữu - Owner)
   */
  async updateCompany(
    id: string,
    payload: UpdateCompanyPayload,
  ): Promise<CompanyItem> {
    const response = await axiosClient.patch<never, ApiResponse<CompanyItem>>(
      API_ENDPOINTS.COMPANY.UPDATE(id),
      payload,
    );
    return response.data;
  },

  /**
   * Lấy danh sách thành viên của một công ty
   */
  async getCompanyMembers(
    id: string,
    params?: { status?: string; page?: number; pageSize?: number },
  ): Promise<{ items: CompanyMember[]; totalCount: number }> {
    const response = await axiosClient.get<never, ApiResponse<CompanyMember[]>>(
      API_ENDPOINTS.COMPANY.MEMBERS(id),
      { params },
    );

    return {
      items: response.data || [],
      totalCount:
        (response.meta?.totalItems as number) || (response.data?.length ?? 0),
    };
  },

  /**
   * Gửi lời mời gia nhập công ty (Yêu cầu Email của tài khoản Recruiter)
   */
  async inviteMember(
    id: string,
    payload: InviteRecruiterPayload,
  ): Promise<ApiResponse<unknown>> {
    return await axiosClient.post<never, ApiResponse<unknown>>(
      API_ENDPOINTS.COMPANY.INVITATIONS(id),
      payload,
    );
  },

  /**
   * Chuyển quyền Chủ sở hữu (Owner) cho thành viên khác
   */
  async transferOwnership(
    id: string,
    newOwnerId: string,
  ): Promise<ApiResponse<unknown>> {
    return await axiosClient.put<never, ApiResponse<unknown>>(
      API_ENDPOINTS.COMPANY.TRANSFER_OWNERSHIP(id),
      { newOwnerId },
    );
  },

  /**
   * Lấy danh sách lời mời gia nhập công ty của recruiter hiện tại
   */
  async getMyInvitations(params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: CompanyInvitationItem[]; totalCount: number }> {
    const response = await axiosClient.get<
      never,
      ApiResponse<CompanyInvitationItem[]>
    >(API_ENDPOINTS.COMPANY.MY_INVITATIONS, { params });

    return {
      items: response.data || [],
      totalCount:
        (response.meta?.totalItems as number) || (response.data?.length ?? 0),
    };
  },

  /**
   * Chấp nhận lời mời gia nhập công ty
   */
  async acceptInvitation(
    invitationId: string,
  ): Promise<AcceptInvitationResult> {
    const response = await axiosClient.post<
      never,
      ApiResponse<AcceptInvitationResult>
    >(API_ENDPOINTS.COMPANY.ACCEPT_INVITATION(invitationId));
    if (response.data?.membership?.companyId) {
      addStoredMyCompanyId(response.data.membership.companyId);
    }
    return response.data;
  },

  /**
   * Từ chối lời mời gia nhập công ty
   */
  async rejectInvitation(invitationId: string): Promise<void> {
    await axiosClient.post<never, void>(
      API_ENDPOINTS.COMPANY.REJECT_INVITATION(invitationId),
    );
  },

  /**
   * Lấy danh sách yêu cầu gia nhập công ty (Chỉ Owner - API 10)
   */
  async getCompanyJoinRequests(
    companyId: string,
    params?: { status?: string; page?: number; pageSize?: number },
  ): Promise<{ items: CompanyJoinRequestItem[]; totalCount: number }> {
    const response = await axiosClient.get<
      never,
      ApiResponse<CompanyJoinRequestItem[]>
    >(API_ENDPOINTS.COMPANY.JOIN_REQUESTS(companyId), { params });

    return {
      items: response.data || [],
      totalCount:
        (response.meta?.totalItems as number) || (response.data?.length ?? 0),
    };
  },

  /**
   * Phê duyệt hoặc từ chối yêu cầu gia nhập công ty (Chỉ Owner - API 11)
   */
  async reviewJoinRequest(
    companyId: string,
    requestId: string,
    payload: ReviewJoinRequestPayload,
  ): Promise<ReviewJoinRequestResult> {
    const response = await axiosClient.patch<
      never,
      ApiResponse<ReviewJoinRequestResult>
    >(API_ENDPOINTS.COMPANY.REVIEW_JOIN_REQUEST(companyId, requestId), payload);

    return response.data;
  },

  /**
   * Lấy danh sách tin tuyển dụng của công ty (dành cho Recruiter thành viên - API 15)
   */
  async getCompanyJobPostings(
    companyId: string,
    params?: {
      status?: string;
      search?: string;
      page?: number;
      pageSize?: number;
    },
  ): Promise<{ items: JobPostingItem[]; totalCount: number }> {
    const response = await axiosClient.get<
      never,
      ApiResponse<JobPostingItem[]>
    >(API_ENDPOINTS.COMPANY.JOB_POSTINGS(companyId), { params });

    return {
      items: response.data || [],
      totalCount:
        (response.meta?.totalItems as number) || (response.data?.length ?? 0),
    };
  },

  /**
   * Lấy danh sách hồ sơ ứng tuyển thuộc công ty (dành cho Recruiter thành viên công ty - API mới)
   */
  async getCompanyApplications(
    companyId: string,
    params?: CompanyApplicationFilterParams,
  ): Promise<{ items: CompanyApplicationListItem[]; totalCount: number }> {
    const response = await axiosClient.get<
      never,
      ApiPagedResponse<CompanyApplicationListItem>
    >(API_ENDPOINTS.COMPANY.APPLICATIONS(companyId), {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        jobId: params?.jobId,
        status: params?.status,
        search: params?.search,
        sort: params?.sort,
        direction: params?.direction,
      },
    });

    const rawData = response?.data as unknown;
    let items: CompanyApplicationListItem[] = [];
    if (Array.isArray(rawData)) {
      items = rawData;
    } else if (
      rawData &&
      typeof rawData === "object" &&
      "items" in rawData &&
      Array.isArray((rawData as { items: unknown }).items)
    ) {
      items = (rawData as { items: CompanyApplicationListItem[] }).items;
    } else if (
      response &&
      "items" in response &&
      Array.isArray((response as unknown as { items: unknown }).items)
    ) {
      items = (
        response as unknown as { items: CompanyApplicationListItem[] }
      ).items;
    }

    const totalCount =
      (response?.meta?.totalItems as number) || items.length;

    return {
      items,
      totalCount,
    };
  },

  /**
   * Owner loại bỏ thành viên khỏi công ty
   */
  async removeMember(companyId: string, memberId: string): Promise<void> {
    await axiosClient.delete<never, void>(
      API_ENDPOINTS.COMPANY.REMOVE_MEMBER(companyId, memberId),
    );
  },

  /**
   * Thành viên tự rời khỏi công ty
   */
  async leaveCompany(companyId: string): Promise<LeaveCompanyResult> {
    const response = await axiosClient.post<
      never,
      ApiResponse<LeaveCompanyResult>
    >(API_ENDPOINTS.COMPANY.LEAVE(companyId));
    return response.data;
  },

  /**
   * Lấy danh sách các công ty mà ứng viên hiện tại đã theo dõi
   */
  async getMyFollowedCompanies(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: FollowedCompanyItem[]; totalCount: number }> {
    const response = await axiosClient.get<
      never,
      ApiPagedResponse<FollowedCompanyItem>
    >(API_ENDPOINTS.COMPANY.FOLLOWED_COMPANIES, {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
      },
    });

    const rawData = response?.data as unknown;
    let items: FollowedCompanyItem[] = [];
    if (Array.isArray(rawData)) {
      items = rawData;
    } else if (
      rawData &&
      typeof rawData === "object" &&
      "items" in rawData &&
      Array.isArray((rawData as { items: unknown }).items)
    ) {
      items = (rawData as { items: FollowedCompanyItem[] }).items;
    }

    const totalCount =
      (response?.meta?.totalItems as number) || items.length;

    return {
      items,
      totalCount,
    };
  },

  /**
   * Candidate theo dõi công ty
   */
  async followCompany(companyId: string): Promise<void> {
    await axiosClient.post<never, void>(
      API_ENDPOINTS.COMPANY.FOLLOW(companyId),
    );
  },

  /**
   * Candidate hủy theo dõi công ty
   */
  async unfollowCompany(companyId: string): Promise<void> {
    await axiosClient.delete<never, void>(
      API_ENDPOINTS.COMPANY.UNFOLLOW(companyId),
    );
  },
};
