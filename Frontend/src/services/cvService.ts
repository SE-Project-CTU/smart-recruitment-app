import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { ApiResponse } from "@/types";
import type {
  CVItem,
  CVTemplateItem,
  CVVersionItem,
  CreateCvPayload,
  CvFilterParams,
  UpdateCvPayload,
} from "@/types/cv";

export interface PagedCvResult {
  items: CVItem[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface PagedCvTemplateResult {
  items: CVTemplateItem[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export const cvService = {
  /**
   * Lấy danh sách CV của ứng viên hiện tại
   * Backend đã Include Template & PreviewFile trong query -> Không có N+1 query
   */
  async getMyCvs(params?: CvFilterParams): Promise<PagedCvResult> {
    const response = await axiosClient.get<never, ApiResponse<CVItem[]>>(
      API_ENDPOINTS.CV.LIST,
      {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          isPublic: params?.isPublic,
          language: params?.language,
        },
      },
    );

    return {
      items: response.data || [],
      page: (response.meta?.page as number) ?? 1,
      pageSize: (response.meta?.pageSize as number) ?? 20,
      totalItems:
        (response.meta?.totalItems as number) ?? response.data?.length ?? 0,
    };
  },

  /**
   * Lấy chi tiết một CV theo ID
   */
  async getCvDetail(id: string): Promise<CVItem> {
    const response = await axiosClient.get<never, ApiResponse<CVItem>>(
      API_ENDPOINTS.CV.DETAIL(id),
    );
    return response.data;
  },

  /**
   * Tạo một hồ sơ CV mới từ Template
   */
  async createCv(payload: CreateCvPayload): Promise<CVItem> {
    const response = await axiosClient.post<never, ApiResponse<CVItem>>(
      API_ENDPOINTS.CV.CREATE,
      payload,
    );
    return response.data;
  },

  /**
   * Cập nhật thông tin / trạng thái CV (vd: bật/tắt isPublic, đổi tiêu đề)
   */
  async updateCv(id: string, payload: UpdateCvPayload): Promise<CVItem> {
    const response = await axiosClient.put<never, ApiResponse<CVItem>>(
      API_ENDPOINTS.CV.UPDATE(id),
      payload,
    );
    return response.data;
  },

  /**
   * Xóa một hồ sơ CV
   */
  async deleteCv(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.CV.DELETE(id));
  },

  /**
   * Lấy các phiên bản của CV
   */
  async getCvVersions(id: string): Promise<CVVersionItem[]> {
    const response = await axiosClient.get<
      never,
      ApiResponse<CVVersionItem[]>
    >(API_ENDPOINTS.CV.VERSIONS(id));
    return response.data || [];
  },

  /**
   * Lấy danh mục các Mẫu CV (CV Templates)
   */
  async getCvTemplates(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedCvTemplateResult> {
    const response = await axiosClient.get<
      never,
      ApiResponse<CVTemplateItem[]>
    >(API_ENDPOINTS.CV.TEMPLATES, {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        search: params?.search,
      },
    });

    return {
      items: response.data || [],
      page: (response.meta?.page as number) ?? 1,
      pageSize: (response.meta?.pageSize as number) ?? 20,
      totalItems:
        (response.meta?.totalItems as number) ?? response.data?.length ?? 0,
    };
  },

  /**
   * Lấy chi tiết một Mẫu CV
   */
  async getCvTemplateDetail(id: string): Promise<CVTemplateItem> {
    const response = await axiosClient.get<
      never,
      ApiResponse<CVTemplateItem>
    >(API_ENDPOINTS.CV.TEMPLATE_DETAIL(id));
    return response.data;
  },
};
