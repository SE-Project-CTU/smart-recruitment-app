import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { cvService } from "@/services/cvService";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";
import type {
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
 * Hook Query: Xem chi tiết một CV
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
 * Hook Query: Chi tiết một Mẫu CV
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
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || "Tạo CV thất bại";
      toast.warning({ description: message });
    },
  });
};

/**
 * Hook Mutation: Cập nhật CV (sửa tiêu đề, bật/tắt isPublic)
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
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || "Cập nhật CV thất bại";
      toast.warning({ description: message });
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
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || "Xóa CV thất bại";
      toast.warning({ description: message });
    },
  });
};
