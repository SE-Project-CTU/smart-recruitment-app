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


const STORAGE_KEY_MY_COMPANIES = "sr_my_company_ids";

const getStoredMyCompanyIds = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MY_COMPANIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredMyCompanyIds = (ids: string[]) => {
  if (typeof window === "undefined") return;
  try {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    localStorage.setItem(STORAGE_KEY_MY_COMPANIES, JSON.stringify(unique));
  } catch {
    // ignore
  }
};

const addStoredMyCompanyId = (id: string) => {
  if (typeof window === "undefined" || !id) return;
  const current = getStoredMyCompanyIds();
  if (!current.includes(id)) {
    saveStoredMyCompanyIds([...current, id]);
  }
};

export const companyService = {
  /**
   * Xóa cache danh sách ID công ty đã lưu của user
   */
  clearMyCompaniesCache(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_MY_COMPANIES);
    }
  },

  /**
   * Lấy danh sách các công ty mà Recruiter hiện tại thực sự thuộc về (Active membership)
   * Tối ưu hóa:
   * 1. Ưu tiên tra cứu theo Candidate IDs đã biết (từ cache local, active company, lời mời đã nhận)
   *    -> Giảm từ 51 requests N+1 xuống còn 1-3 requests.
   * 2. Chỉ fallback quét khám phá khi chưa từng có dữ liệu công ty nào được lưu.
   */
  async getMyCompanies(): Promise<CompanyItem[]> {
    // 1. Thu thập candidate company IDs
    const candidateIds = new Set<string>(getStoredMyCompanyIds());

    const activeCompanyId =
      typeof window !== "undefined"
        ? localStorage.getItem("sr_active_company_id")
        : null;
    if (activeCompanyId) {
      candidateIds.add(activeCompanyId);
    }

    // Lấy thêm các công ty từ các lời mời đã chấp nhận (chỉ 1 request nhanh tới endpoint của user hiện tại)
    try {
      const invRes = await this.getMyInvitations({
        status: "Accepted",
        pageSize: 50,
      });
      if (invRes.items && Array.isArray(invRes.items)) {
        invRes.items.forEach((inv) => {
          if (inv.companyId) candidateIds.add(inv.companyId);
        });
      }
    } catch {
      // Bỏ qua nếu chưa có lời mời hoặc lỗi mạng nhẹ
    }

    // 2. Nếu đã có candidate IDs: Chỉ gọi chi tiết đúng những công ty này (tránh N+1)
    if (candidateIds.size > 0) {
      const details = await Promise.all(
        Array.from(candidateIds).map(async (id) => {
          try {
            return await this.getCompanyDetail(id);
          } catch {
            return null;
          }
        }),
      );

      const activeCompanies = details.filter(
        (comp): comp is CompanyItem =>
          Boolean(comp && comp.membership && comp.membership.status === "Active"),
      );

      if (activeCompanies.length > 0) {
        saveStoredMyCompanyIds(activeCompanies.map((c) => c.id));
        return activeCompanies;
      }
    }

    // 3. Fallback: Discovery scan (Chỉ chạy khi chưa có bất kỳ candidate ID nào)
    try {
      const response = await axiosClient.get<never, ApiResponse<CompanyItem[]>>(
        API_ENDPOINTS.COMPANY.LIST,
        { params: { page: 1, pageSize: 100 } },
      );

      const allCompanies = response.data || [];
      if (!Array.isArray(allCompanies) || allCompanies.length === 0) {
        return [];
      }

      // Quét theo batch nhỏ (10 requests) để tránh làm nghẽn kết nối mạng
      const activeCompanies: CompanyItem[] = [];
      const batchSize = 10;
      for (let i = 0; i < allCompanies.length; i += batchSize) {
        const batch = allCompanies.slice(i, i + batchSize);
        const batchDetails = await Promise.all(
          batch.map(async (comp) => {
            try {
              return await this.getCompanyDetail(comp.id);
            } catch {
              return null;
            }
          }),
        );

        for (const comp of batchDetails) {
          if (comp && comp.membership && comp.membership.status === "Active") {
            activeCompanies.push(comp);
          }
        }
      }

      if (activeCompanies.length > 0) {
        saveStoredMyCompanyIds(activeCompanies.map((c) => c.id));
      }

      return activeCompanies;
    } catch {
      return [];
    }
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
