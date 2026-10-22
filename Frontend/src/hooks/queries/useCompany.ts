import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyService } from "@/services/companyService";
import type {
  CreateCompanyPayload,
  InviteRecruiterPayload,
  UpdateCompanyPayload,
} from "@/types/company";

/**
 * Hook Query: Lấy danh sách các công ty mà Recruiter hiện tại thực sự thuộc về
 */
export const useMyCompanies = () => {
  return useQuery({
    queryKey: ["companies", "my"],
    queryFn: () => companyService.getMyCompanies(),
    staleTime: 2 * 60 * 1000, // Cache 2 phút
  });
};

/**
 * Hook Query: Lấy thông tin chi tiết một công ty theo ID
 */
export const useCompanyDetail = (companyId?: string) => {
  return useQuery({
    queryKey: ["companies", "detail", companyId],
    queryFn: () => companyService.getCompanyDetail(companyId!),
    enabled: Boolean(companyId),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook Query: Lấy danh sách thành viên trong một công ty
 */
export const useCompanyMembers = (companyId?: string, status?: string) => {
  return useQuery({
    queryKey: ["companies", "members", companyId, status],
    queryFn: () => companyService.getCompanyMembers(companyId!, { status }),
    enabled: Boolean(companyId),
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook Mutation: Tạo hồ sơ doanh nghiệp mới
 */
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCompanyPayload) =>
      companyService.createCompany(payload),
    onSuccess: () => {
      // Làm mới danh sách công ty của recruiter
      queryClient.invalidateQueries({ queryKey: ["companies", "my"] });
    },
  });
};

/**
 * Hook Mutation: Cập nhật thông tin doanh nghiệp (Chỉ Owner)
 */
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCompanyPayload;
    }) => companyService.updateCompany(id, payload),
    onSuccess: (updatedCompany) => {
      // Cập nhật cache chi tiết và danh sách
      queryClient.setQueryData(
        ["companies", "detail", updatedCompany.id],
        updatedCompany,
      );
      queryClient.invalidateQueries({ queryKey: ["companies", "my"] });
    },
  });
};

/**
 * Hook Mutation: Mời chuyên viên tuyển dụng tham gia công ty
 */
export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      payload,
    }: {
      companyId: string;
      payload: InviteRecruiterPayload;
    }) => companyService.inviteMember(companyId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["companies", "members", variables.companyId],
      });
    },
  });
};

/**
 * Hook Mutation: Chuyển quyền Chủ sở hữu (Owner)
 */
export const useTransferOwnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      newOwnerId,
    }: {
      companyId: string;
      newOwnerId: string;
    }) => companyService.transferOwnership(companyId, newOwnerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["companies", "detail", variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["companies", "members", variables.companyId],
      });
      queryClient.invalidateQueries({ queryKey: ["companies", "my"] });
    },
  });
};
