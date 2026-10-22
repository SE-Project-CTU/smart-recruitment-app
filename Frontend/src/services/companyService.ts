import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { MOCK_COMPANIES } from "@/constants/mockData";
import type { ApiResponse } from "@/types/auth";
import type {
  CompanyItem,
  CompanyMember,
  CreateCompanyPayload,
  InviteRecruiterPayload,
  UpdateCompanyPayload,
} from "@/types/company";

// Local in-memory state for mock fallback so that created/edited companies persist during session
let memoryCompanies: CompanyItem[] = [...MOCK_COMPANIES];

const MOCK_COMPANY_MEMBERS: Record<string, CompanyMember[]> = {
  "a6a0e6ce-c1dd-4bb8-bf2a-5f7d4c6d7b55": [
    {
      id: "mem-1",
      user: {
        id: "u-1",
        fullName: "Nguyễn Văn Quản",
        email: "owner@smarthire.example",
        avatarUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      },
      role: "Owner",
      status: "Active",
      joinedAt: "2026-09-28T10:30:00Z",
    },
    {
      id: "mem-2",
      user: {
        id: "u-2",
        fullName: "Trần Thị Thu",
        email: "recruiter.thu@smarthire.example",
        avatarUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      },
      role: "Member",
      status: "Active",
      joinedAt: "2026-09-30T09:15:00Z",
    },
    {
      id: "mem-3",
      user: {
        id: "u-3",
        fullName: "Lê Minh Trí",
        email: "tri.le@smarthire.example",
        avatarUrl: null,
      },
      role: "Member",
      status: "Active",
      joinedAt: "2026-10-02T14:20:00Z",
    },
    {
      id: "mem-4",
      user: {
        id: "u-4",
        fullName: "Phạm Hoàng Long",
        email: "long.pham@smarthire.example",
        avatarUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      },
      role: "Member",
      status: "Inactive",
      joinedAt: "2026-10-05T08:00:00Z",
    },
  ],
  "b7b1f7df-d2ee-4cc9-c03b-6f8e5d7e8c66": [
    {
      id: "mem-5",
      user: {
        id: "u-5",
        fullName: "Đỗ Anh Tuấn",
        email: "tuan.do@technova.vn",
        avatarUrl: null,
      },
      role: "Owner",
      status: "Active",
      joinedAt: "2026-08-10T04:20:00Z",
    },
    {
      id: "mem-6",
      user: {
        id: "u-me",
        fullName: "Tài khoản Recruiter",
        email: "recruiter@example.com",
        avatarUrl:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      },
      role: "Member",
      status: "Active",
      joinedAt: "2026-08-15T09:15:00Z",
    },
    {
      id: "mem-7",
      user: {
        id: "u-7",
        fullName: "Vũ Thùy Linh",
        email: "linh.vu@technova.vn",
        avatarUrl:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
      },
      role: "Member",
      status: "Active",
      joinedAt: "2026-08-20T10:00:00Z",
    },
  ],
  "d9d3f9fb-f4aa-4ee1-e25d-8b0a7f9a0e88": [
    {
      id: "mem-8",
      user: {
        id: "u-me",
        fullName: "Tài khoản Recruiter",
        email: "recruiter@example.com",
        avatarUrl:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      },
      role: "Owner",
      status: "Active",
      joinedAt: "2026-10-01T08:10:00Z",
    },
  ],
};

export const companyService = {
  /**
   * Lấy danh sách công ty của Recruiter
   */
  async getMyCompanies(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: CompanyItem[]; totalCount: number }> {
    try {
      const response = await axiosClient.get<never, ApiResponse<CompanyItem[]>>(
        API_ENDPOINTS.COMPANY.LIST,
        { params },
      );
      if (response?.data && Array.isArray(response.data)) {
        return {
          items: response.data,
          totalCount: (response.meta?.totalItems as number) || response.data.length,
        };
      }
    } catch {
      // Fallback gracefully to mock data
    }

    let items = memoryCompanies.map((c, index) => {
      // Demo memberships: Company 0 and 2 are Owner, others are Member
      const role = index % 2 === 0 ? "Owner" : "Member";
      return {
        ...c,
        membership: c.membership ?? {
          role: role as "Owner" | "Member",
          status: "Active" as const,
        },
      };
    });

    if (params?.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.taxCode.includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }

    return {
      items,
      totalCount: items.length,
    };
  },

  /**
   * Xem chi tiết 1 công ty
   */
  async getCompanyDetail(id: string): Promise<CompanyItem> {
    try {
      const response = await axiosClient.get<never, ApiResponse<CompanyItem>>(
        API_ENDPOINTS.COMPANY.DETAIL(id),
      );
      if (response?.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    const found = memoryCompanies.find((c) => c.id === id);
    if (!found) {
      throw new Error("Không tìm thấy thông tin doanh nghiệp");
    }

    // Default membership if not set: default to Owner for SmartHire, Member for TechNova
    const isOwner =
      found.id === "a6a0e6ce-c1dd-4bb8-bf2a-5f7d4c6d7b55" ||
      found.id === "d9d3f9fb-f4aa-4ee1-e25d-8b0a7f9a0e88";

    return {
      ...found,
      membership: found.membership ?? {
        role: isOwner ? "Owner" : "Member",
        status: "Active",
      },
    };
  },

  /**
   * Tạo doanh nghiệp mới
   */
  async createCompany(payload: CreateCompanyPayload): Promise<CompanyItem> {
    try {
      const response = await axiosClient.post<never, ApiResponse<CompanyItem>>(
        API_ENDPOINTS.COMPANY.CREATE,
        payload,
      );
      if (response?.data) {
        memoryCompanies.unshift(response.data);
        return response.data;
      }
    } catch {
      // Fallback
    }

    const now = new Date().toISOString();
    const newCompany: CompanyItem = {
      id: crypto.randomUUID(),
      name: payload.name,
      taxCode: payload.taxCode,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      website: payload.website || "",
      description: payload.description || "",
      logoUrl: payload.logoUrl || null,
      verificationStatus: "Pending", // Mặc định chờ duyệt
      verifiedAt: null,
      createdAt: now,
      updatedAt: now,
      membership: {
        role: "Owner",
        status: "Active",
      },
    };

    memoryCompanies.unshift(newCompany);
    return newCompany;
  },

  /**
   * Cập nhật thông tin công ty (Chỉ Owner)
   */
  async updateCompany(
    id: string,
    payload: UpdateCompanyPayload,
  ): Promise<CompanyItem> {
    try {
      const response = await axiosClient.patch<never, ApiResponse<CompanyItem>>(
        API_ENDPOINTS.COMPANY.UPDATE(id),
        payload,
      );
      if (response?.data) {
        memoryCompanies = memoryCompanies.map((c) =>
          c.id === id ? { ...c, ...response.data } : c,
        );
        return response.data;
      }
    } catch {
      // Fallback
    }

    const index = memoryCompanies.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Không tìm thấy công ty");
    }

    const updated: CompanyItem = {
      ...memoryCompanies[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    memoryCompanies[index] = updated;
    return updated;
  },

  /**
   * Lấy danh sách thành viên công ty
   */
  async getCompanyMembers(
    id: string,
    params?: { status?: string; page?: number; pageSize?: number },
  ): Promise<{ items: CompanyMember[]; totalCount: number }> {
    try {
      const response = await axiosClient.get<
        never,
        ApiResponse<CompanyMember[]>
      >(API_ENDPOINTS.COMPANY.MEMBERS(id), { params });
      if (response?.data && Array.isArray(response.data)) {
        return {
          items: response.data,
          totalCount:
            (response.meta?.totalItems as number) || response.data.length,
        };
      }
    } catch {
      // Fallback
    }

    const members = MOCK_COMPANY_MEMBERS[id] || [
      {
        id: `mem-${id.slice(0, 4)}`,
        user: {
          id: "u-owner",
          fullName: "Chủ sở hữu công ty",
          email: "owner@company.example",
          avatarUrl: null,
        },
        role: "Owner",
        status: "Active",
        joinedAt: new Date().toISOString(),
      },
    ];

    return {
      items: members,
      totalCount: members.length,
    };
  },

  /**
   * Mời chuyên viên tuyển dụng
   */
  async inviteMember(
    id: string,
    payload: InviteRecruiterPayload,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await axiosClient.post(API_ENDPOINTS.COMPANY.INVITATIONS(id), payload);
      return { success: true, message: "Đã gửi lời mời thành công." };
    } catch {
      // Mock success for testing
      return {
        success: true,
        message: "Đã gửi lời mời gia nhập công ty thành công (Mô phỏng).",
      };
    }
  },

  /**
   * Chuyển quyền Chủ sở hữu (Owner)
   */
  async transferOwnership(
    id: string,
    newOwnerId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await axiosClient.put(API_ENDPOINTS.COMPANY.TRANSFER_OWNERSHIP(id), {
        newOwnerId,
      });
      return { success: true, message: "Đã chuyển quyền thành công." };
    } catch {
      return {
        success: true,
        message: "Chuyển giao quyền Chủ sở hữu thành công (Mô phỏng).",
      };
    }
  },
};
