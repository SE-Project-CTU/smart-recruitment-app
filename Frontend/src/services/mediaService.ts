import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { ApiResponse } from "@/types/auth";
import type { MediaFile, DeleteMediaResult } from "@/types/media";

export const mediaService = {
  /**
   * Tải lên hình ảnh (Avatar, Logo, Thumbnail)
   * Tối đa 5MB: .jpg, .jpeg, .png, .webp
   */
  uploadImage(file: File): Promise<ApiResponse<MediaFile>> {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post<never, ApiResponse<MediaFile>>(
      API_ENDPOINTS.MEDIA.UPLOAD_IMAGE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  /**
   * Tải lên file PDF (CV)
   * Tối đa 10MB: .pdf
   */
  uploadPdf(file: File): Promise<ApiResponse<MediaFile>> {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post<never, ApiResponse<MediaFile>>(
      API_ENDPOINTS.MEDIA.UPLOAD_PDF,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  /**
   * Xóa file
   */
  deleteFile(id: string): Promise<ApiResponse<DeleteMediaResult>> {
    return axiosClient.delete<never, ApiResponse<DeleteMediaResult>>(
      API_ENDPOINTS.MEDIA.DELETE(id),
    );
  },
};
