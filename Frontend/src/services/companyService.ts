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
   * Cache ID chỉ dùng làm gợi ý; membership luôn được xác thực lại từ API.
   */
  async getMyCompanies(options?: {
    forceRefresh?: boolean;
  }): Promise<CompanyItem[]> {
    const userId = getCurrentUserId();
    const companyIds = new Set<string>(getStoredMyCompanyIds(userId));

    const activeCompanyId =
      typeof window !== "undefined"
        ? localStorage.getItem("sr_active_company_id")
        : null;
    if (activeCompanyId) {
      companyIds.add(activeCompanyId);
    }

    const lastScanTime = getStoredScanTimestamp(userId);
    const isScanFresh =
      !options?.forceRefresh &&
      lastScanTime !== null &&
      Date.now() - lastScanTime < 5 * 60 * 1000;
    const shouldDiscoverCompanies = !isScanFresh;

    if (shouldDiscoverCompanies) {
      const [publicCompanyIds, acceptedInvitations] = await Promise.all([
        getAllPublicCompanyIds(),
        this.getMyInvitations({ status: "Accepted", pageSize: 50 }),
      ]);
      publicCompanyIds.forEach((id) => companyIds.add(id));
      acceptedInvitations.items.forEach((invitation) => {
        if (invitation.companyId) companyIds.add(invitation.companyId);
      });
    }

    const companyIdList = Array.from(companyIds);
    const activeCompanies = new Map<string, CompanyItem>();
    let allDetailsLoaded = true;
    const batchSize = 10;

    for (let i = 0; i < companyIdList.length; i += batchSize) {
      const batch = companyIdList.slice(i, i + batchSize);
      const details = await Promise.all(
        batch.map(async (id) => {
          try {
            return await this.getCompanyDetail(id);
          } catch {
            allDetailsLoaded = false;
            return null;
          }
        }),
      );

      details.forEach((company) => {
        if (company?.membership?.status === "Active") {
          activeCompanies.set(company.id, company);
        }
      });
    }

    if (allDetailsLoaded) {
      const activeCompanyIds = Array.from(activeCompanies.keys());
      saveStoredMyCompanyIds(userId, activeCompanyIds);
      if (shouldDiscoverCompanies) {
        saveStoredScanTimestamp(userId);
      }
    }

    return Array.from(activeCompanies.values());
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
};
