import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { cvService, type PagedCvResult } from "@/services/cvService";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/api/errorHandler";
import type {
  CVItem,
  CreateCvPayload,
  CvFilterParams,
  UpdateCvPayload,
} from "@/types/cv";

/**
 * Hook Query: Lấy danh sách CV của ứng viên
 */
export const useMyCvs = (params?: CvFilterParams) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["cvs", "my", user?.id, params],
    queryFn: () => cvService.getMyCvs(params),
    enabled: Boolean(user?.id),
    staleTime: 2 * 60 * 1000, // 2 phút
  });
};

/**
 * Hook Query: Xem chi tiết một CV (trả về full content & layout)
 */
export const useCvDetail = (cvId?: string) => {
  return useQuery({
    queryKey: ["cvs", "detail", cvId],
    queryFn: () => cvService.getCvDetail(cvId!),
    enabled: Boolean(cvId),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook Query: Lấy danh sách các phiên bản của CV
 */
export const useCvVersions = (
  cvId?: string,
  params?: { page?: number; pageSize?: number },
) => {
  return useQuery({
    queryKey: ["cvs", "versions", cvId, params],
    queryFn: () => cvService.getCvVersions(cvId!, params),
    enabled: Boolean(cvId),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook Query: Lấy chi tiết một phiên bản lịch sử của CV
 */
export const useCvVersionDetail = (cvId?: string, versionId?: string) => {
  return useQuery({
    queryKey: ["cvs", "versions", cvId, versionId],
    queryFn: () => cvService.getCvVersionDetail(cvId!, versionId!),
    enabled: Boolean(cvId && versionId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook Query: Lấy danh mục các Mẫu CV gợi ý (CV Templates)
 */
export const useCvTemplates = (params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: ["cv-templates", params],
    queryFn: () => cvService.getCvTemplates(params),
    staleTime: 5 * 60 * 1000, // Template rất ít khi đổi, cache 5 phút
  });
};

/**
 * Hook Query: Chi tiết một Mẫu CV (bao gồm defaultContent và defaultLayout)
 */
export const useCvTemplateDetail = (templateId?: string) => {
  return useQuery({
    queryKey: ["cv-templates", "detail", templateId],
    queryFn: () => cvService.getCvTemplateDetail(templateId!),
    enabled: Boolean(templateId),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook Mutation: Tạo CV mới
 */
export const useCreateCv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCvPayload) => cvService.createCv(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cvs", "my"] });
      toast.success({ description: "Tạo hồ sơ CV thành công" });
    },
    onError: (err: unknown) => {
      const message = getApiErrorMessage(err, "Tạo hồ sơ CV thất bại");
      toast.warning({ description: message });
    },
  });
};

/**
 * Hook Mutation: Cập nhật CV (sửa tiêu đề, bật/tắt isPublic, cập nhật nội dung)
 */
export const useUpdateCv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCvPayload;
    }) => cvService.updateCv(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cvs", "my"] });
      queryClient.invalidateQueries({
        queryKey: ["cvs", "detail", variables.id],
      });
      toast.success({ description: "Cập nhật hồ sơ CV thành công" });
    },
    onError: (err: unknown) => {
      const message = getApiErrorMessage(err, "Cập nhật hồ sơ CV thất bại");
      toast.warning({ description: message });
    },
  });
};

/**
 * Hook Mutation: Chuyển đổi nhanh chế độ Công khai / Riêng tư (Optimistic Direct Cache Update)
 * Cập nhật trực tiếp vào React Query Cache, không gọi invalidateQueries để tránh giật layout khi switch nhiều CV
 */
export const useToggleCvPublic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      cvService.updateCv(id, { isPublic }),

    onMutate: async ({ id, isPublic }) => {
      // Huỷ các fetch dở dang để không ghi đè dữ liệu lạc quan
      await queryClient.cancelQueries({ queryKey: ["cvs", "my"] });

      // Lưu snapshot cache cũ để rollback nếu có lỗi
      const previousData = queryClient.getQueriesData({ queryKey: ["cvs", "my"] });

      // Cập nhật lạc quan trực tiếp trên Cache của React Query
      queryClient.setQueriesData<PagedCvResult>(
        { queryKey: ["cvs", "my"] },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((item: CVItem) =>
              item.id === id ? { ...item, isPublic } : item,
            ),
          };
        },
      );

      return { previousData };
    },

    onError: (err: unknown, _, context) => {
      // Rollback lại dữ liệu cũ nếu API thất bại
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      const message = getApiErrorMessage(
        err,
        "Không thể thay đổi chế độ hiển thị CV",
      );
      toast.warning({ description: message });
    },

    onSuccess: (updatedCv, variables) => {
      // Cập nhật trạng thái chuẩn xác từ server vào Cache mà KHÔNG làm giật giao diện
      queryClient.setQueriesData<PagedCvResult>(
        { queryKey: ["cvs", "my"] },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((item: CVItem) =>
              item.id === variables.id
                ? { ...item, isPublic: updatedCv.isPublic ?? variables.isPublic }
                : item,
            ),
          };
        },
      );

      toast.success({
        description: variables.isPublic
          ? "Đã chuyển CV sang chế độ Công khai"
          : "Đã chuyển CV sang chế độ Riêng tư",
      });
    },
  });
};

/**
 * Hook Mutation: Xóa CV
 */
export const useDeleteCv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cvService.deleteCv(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cvs", "my"] });
      toast.success({ description: "Đã xóa hồ sơ CV thành công" });
    },
    onError: (err: unknown) => {
      const message = getApiErrorMessage(err, "Xóa hồ sơ CV thất bại");
      toast.warning({ description: message });
    },
  });
};
