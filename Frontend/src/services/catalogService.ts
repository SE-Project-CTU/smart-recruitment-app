import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  ApiResponse,
  IndustryGroupWithIndustriesItem,
  IndustryItem,
  ProvinceItem,
  SkillItem,
  WardItem,
} from "@/types";

export const catalogService = {
  /**
   * Lấy danh sách 63 tỉnh/thành phố (mặc định pageSize=100 lấy toàn bộ một lần)
   */
  async getProvinces(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ProvinceItem[]> {
    const response = await axiosClient.get<never, ApiResponse<ProvinceItem[]>>(
      API_ENDPOINTS.CATALOG.PROVINCES,
      {
        params: {
          search: params?.search,
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 100,
        },
      },
    );
    return response.data || [];
  },

  /**
   * Lấy danh sách phường/xã thuộc một tỉnh/thành phố
   */
  async getWards(params: {
    provinceId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<WardItem[]> {
    if (!params.provinceId) return [];

    const response = await axiosClient.get<never, ApiResponse<WardItem[]>>(
      API_ENDPOINTS.CATALOG.WARDS,
      {
        params: {
          provinceId: params.provinceId,
          search: params.search,
          page: params.page ?? 1,
          pageSize: params?.pageSize ?? 100,
        },
      },
    );
    return response.data || [];
  },

  /**
   * Lấy danh sách toàn bộ 8 nhóm ngành kèm các ngành nghề con tương ứng
   */
  async getIndustryGroupsWithIndustries(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<IndustryGroupWithIndustriesItem[]> {
    const response = await axiosClient.get<
      never,
      ApiResponse<IndustryGroupWithIndustriesItem[]>
    >(API_ENDPOINTS.CATALOG.INDUSTRY_GROUPS_WITH_INDUSTRIES, {
      params: {
        search: params?.search,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 100,
      },
    });
    return response.data || [];
  },

  /**
   * Lấy danh sách ngành nghề (có thể lọc theo groupId hoặc từ khóa tìm kiếm)
   */
  async getIndustries(params?: {
    groupId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<IndustryItem[]> {
    const response = await axiosClient.get<never, ApiResponse<IndustryItem[]>>(
      API_ENDPOINTS.CATALOG.INDUSTRIES,
      {
        params: {
          groupId: params?.groupId,
          search: params?.search,
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 100,
        },
      },
    );
    return response.data || [];
  },

  /**
   * Lấy danh mục kỹ năng (hỗ trợ phân trang và tìm kiếm theo từ khóa)
   */
  async getSkills(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<SkillItem[]> {
    const response = await axiosClient.get<never, ApiResponse<SkillItem[]>>(
      API_ENDPOINTS.CATALOG.SKILLS,
      {
        params: {
          search: params?.search,
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 100,
        },
      },
    );
    return response.data || [];
  },
};
