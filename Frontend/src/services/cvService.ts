import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { ApiResponse } from "@/types";
import type {
  CVItem,
  CVTemplateDetail,
  CVTemplateItem,
  CVVersionDetail,
  CVVersionItem,
  CreateCvPayload,
  CvFilterParams,
  RichTextCVDetail,
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

export interface PagedCvVersionResult {
  items: CVVersionItem[];
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
   * Lấy chi tiết một CV theo ID (trả về đầy đủ content & layout)
   */
  async getCvDetail(id: string): Promise<RichTextCVDetail> {
    const response = await axiosClient.get<
      never,
      ApiResponse<RichTextCVDetail>
    >(API_ENDPOINTS.CV.DETAIL(id));
    return response.data;
  },

  /**
   * Tạo một hồ sơ CV mới từ Template
   */
  async createCv(payload: CreateCvPayload): Promise<RichTextCVDetail> {
    const response = await axiosClient.post<
      never,
      ApiResponse<RichTextCVDetail> | RichTextCVDetail
    >(API_ENDPOINTS.CV.CREATE, payload);
    const data = (response as ApiResponse<RichTextCVDetail>)?.data ?? response;
    return data as RichTextCVDetail;
  },

  /**
   * Cập nhật thông tin / trạng thái / nội dung CV
   */
  async updateCv(
    id: string,
    payload: UpdateCvPayload,
  ): Promise<RichTextCVDetail> {
    const response = await axiosClient.patch<
      never,
      ApiResponse<RichTextCVDetail> | RichTextCVDetail
    >(API_ENDPOINTS.CV.UPDATE(id), payload);
    const data = (response as ApiResponse<RichTextCVDetail>)?.data ?? response;
    return data as RichTextCVDetail;
  },

  /**
   * Xóa một hồ sơ CV
   */
  async deleteCv(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.CV.DELETE(id));
  },

  /**
   * Lấy danh sách phiên bản của CV (có phân trang)
   */
  async getCvVersions(
    id: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<PagedCvVersionResult> {
    const response = await axiosClient.get<
      never,
      ApiResponse<CVVersionItem[]>
    >(API_ENDPOINTS.CV.VERSIONS(id), {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
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
   * Lấy chi tiết một phiên bản lịch sử cụ thể của CV
   */
  async getCvVersionDetail(
    cvId: string,
    versionId: string,
  ): Promise<CVVersionDetail> {
    const response = await axiosClient.get<
      never,
      ApiResponse<CVVersionDetail>
    >(API_ENDPOINTS.CV.VERSION_DETAIL(cvId, versionId));
    return response.data;
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
   * Lấy chi tiết một Mẫu CV (kèm defaultContent và defaultLayout)
   */
  async getCvTemplateDetail(id: string): Promise<CVTemplateDetail> {
    const response = await axiosClient.get<
      never,
      ApiResponse<CVTemplateDetail>
    >(API_ENDPOINTS.CV.TEMPLATE_DETAIL(id));
    return response.data;
  },
};
