import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  AcceptInvitationResult,
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


export const companyService = {
  /**
   * Lấy danh sách các công ty mà Recruiter hiện tại thực sự thuộc về (Active membership)
   * Lấy danh sách qua GET /api/v1/companies và kiểm tra chi tiết membership của user
   */
  async getMyCompanies(): Promise<CompanyItem[]> {
    const response = await axiosClient.get<never, ApiResponse<CompanyItem[]>>(
      API_ENDPOINTS.COMPANY.LIST,
      { params: { page: 1, pageSize: 50 } },
    );

    const allCompanies = response.data || [];
    if (!Array.isArray(allCompanies) || allCompanies.length === 0) {
      return [];
    }

    // Backend endpoint GET /companies không gắn membership context của caller.
    // Gọi song song GET /companies/{id} để lấy đúng tư cách thành viên của tài khoản hiện tại.
    const details = await Promise.all(
      allCompanies.map(async (comp) => {
        try {
          const detailRes = await axiosClient.get<never, ApiResponse<CompanyItem>>(
            API_ENDPOINTS.COMPANY.DETAIL(comp.id),
          );
          return detailRes.data;
        } catch {
          return null;
        }
      }),
    );

    // Chỉ giữ lại những công ty mà tài khoản hiện tại có quan hệ thành viên hợp lệ (Owner hoặc Member)
    return details.filter(
      (comp): comp is CompanyItem =>
        Boolean(comp && comp.membership && comp.membership.status === "Active"),
    );
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
    const response = await axiosClient.get<never, ApiResponse<CompanyItem[]>>(
      API_ENDPOINTS.COMPANY.LIST,
      { params: { page: 1, pageSize: 100, ...params } },
    );
    return response.data || [];
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
      totalCount: (response.meta?.totalItems as number) || (response.data?.length ?? 0),
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
    params?: { status?: string; search?: string; page?: number; pageSize?: number },
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
