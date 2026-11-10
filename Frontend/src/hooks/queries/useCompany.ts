import { useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { companyService } from "@/services/companyService";
import { useAuthStore } from "@/stores/authStore";
import { useCompanyStore } from "@/stores/companyStore";
import type {
  CreateCompanyPayload,
  InviteRecruiterPayload,
  ReviewJoinRequestPayload,
  SubmitJoinRequestPayload,
  UpdateCompanyPayload,
  CompanyApplicationFilterParams,
} from "@/types/company";

/**
 * Hook Query: Lấy danh sách các công ty mà Recruiter hiện tại thực sự thuộc về
 */
export const useMyCompanies = () => {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["companies", "my", user?.id],
    queryFn: () => companyService.getMyCompanies(),
    enabled: Boolean(user?.id),
    staleTime: 5 * 60 * 1000, // Tăng lên 5 phút để giảm thiểu số lần quét nặng
  });
};

/**
 * Hook Query: Lấy thông tin chi tiết một công ty theo ID
 */
export const useCompanyDetail = (companyId?: string) => {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["companies", "detail", companyId, user?.id ?? "anonymous"],
    queryFn: () => companyService.getCompanyDetail(companyId!),
    enabled: Boolean(companyId) && !isInitializing,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook Query: Lấy danh sách các công ty công khai (hỗ trợ avatar & thông tin doanh nghiệp, tránh N+1 query)
 */
export const usePublicCompanies = (params?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: [
      "companies",
      "public",
      params?.search,
      params?.status,
      params?.page ?? 1,
      params?.pageSize ?? 100,
    ],
    queryFn: () => companyService.getPublicCompanies(params),
    staleTime: 5 * 60 * 1000, // Cache 5 phút
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
      queryClient.invalidateQueries({ queryKey: ["companies", "detail"] });
      queryClient.setQueryData(
        ["companies", "detail", updatedCompany.id],
        updatedCompany,
      );
      queryClient.invalidateQueries({ queryKey: ["companies", "my"] });
      queryClient.invalidateQueries({ queryKey: ["companies", "public"] });

      // Nếu công ty vừa cập nhật là activeCompany hiện tại, cập nhật ngay lập tức vào companyStore
      const activeId = useCompanyStore.getState().activeCompanyId;
      if (activeId === updatedCompany.id) {
        useCompanyStore.getState().setActiveCompany(updatedCompany);
      }
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
 * Hook Mutation: Gửi yêu cầu gia nhập công ty (API 9 - Recruiter)
 */
export const useSubmitJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      payload,
    }: {
      companyId: string;
      payload?: SubmitJoinRequestPayload;
    }) => companyService.submitJoinRequest(companyId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["companies", "detail", variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["companies", "join-requests", variables.companyId],
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

/**
 * Hook Query: Lấy danh sách lời mời gia nhập công ty theo trạng thái
 */
export const useMyCompanyInvitations = (params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: [
      "company-invitations",
      "my",
      params?.status,
      params?.page,
      params?.pageSize,
    ],
    queryFn: () => companyService.getMyInvitations(params),
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook Query: Lấy toàn bộ lời mời gia nhập và thống kê theo từng trạng thái qua 1 API call duy nhất
 */
export const useMyCompanyInvitationsAll = (_activeTab?: string) => {
  const query = useQuery({
    queryKey: ["company-invitations", "my", "all"],
    queryFn: () => companyService.getMyInvitations({ page: 1, pageSize: 100 }),
    staleTime: 1 * 60 * 1000,
  });

  const allItems = useMemo(
    () =>
      (query.data?.items ?? []).slice().sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [query.data?.items],
  );

  const byStatus = useMemo(
    () => ({
      Pending: allItems.filter((i) => i.status === "Pending"),
      Accepted: allItems.filter((i) => i.status === "Accepted"),
      Rejected: allItems.filter((i) => i.status === "Rejected"),
      Expired: allItems.filter((i) => i.status === "Expired"),
    }),
    [allItems],
  );

  const counts = useMemo(
    () => ({
      ALL: allItems.length,
      Pending: byStatus.Pending.length,
      Accepted: byStatus.Accepted.length,
      Rejected: byStatus.Rejected.length,
      Expired: byStatus.Expired.length,
    }),
    [allItems, byStatus],
  );

  return {
    items: allItems,
    byStatus,
    counts,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

/**
 * Hook Mutation: Chấp nhận lời mời gia nhập công ty
 */
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      companyService.acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["companies", "my"] });
    },
  });
};

/**
 * Hook Mutation: Từ chối lời mời gia nhập công ty
 */
export const useRejectInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      companyService.rejectInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-invitations"] });
    },
  });
};

/**
 * Hook Query: Lấy danh sách yêu cầu gia nhập công ty (Chỉ Owner - API 10)
 */
export const useCompanyJoinRequests = (companyId?: string, status?: string) => {
  return useQuery({
    queryKey: ["companies", "join-requests", companyId, status],
    queryFn: () =>
      companyService.getCompanyJoinRequests(companyId!, { status }),
    enabled: Boolean(companyId),
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook Mutation: Phê duyệt hoặc từ chối yêu cầu gia nhập (Chỉ Owner - API 11)
 */
export const useReviewJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      requestId,
      payload,
    }: {
      companyId: string;
      requestId: string;
      payload: ReviewJoinRequestPayload;
    }) => companyService.reviewJoinRequest(companyId, requestId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["companies", "join-requests", variables.companyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["companies", "members", variables.companyId],
      });
    },
  });
};

/**
 * Hook Query: Lấy danh sách hồ sơ ứng tuyển của một công ty (dành cho Recruiter thành viên)
 */
export const useCompanyApplications = (
  companyId?: string,
  params?: CompanyApplicationFilterParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["companies", "applications", companyId, params],
    queryFn: () => companyService.getCompanyApplications(companyId!, params),
    enabled: Boolean(companyId) && (options?.enabled ?? true),
    staleTime: 30 * 1000,
  });
};

/**
 * Hook Mutation: Owner loại bỏ thành viên khỏi công ty
 */
export const useRemoveCompanyMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      memberId,
    }: {
      companyId: string;
      memberId: string;
    }) => companyService.removeMember(companyId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["companies", "members", variables.companyId],
      });
      queryClient.invalidateQueries({ queryKey: ["companies", "my"] });
    },
  });
};

/**
 * Hook Mutation: Recruiter tự rời khỏi công ty
 */
export const useLeaveCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => companyService.leaveCompany(companyId),
    onSuccess: (_, companyId) => {
      queryClient.invalidateQueries({
        queryKey: ["companies", "members", companyId],
      });
      queryClient.invalidateQueries({ queryKey: ["companies", "my"] });
    },
  });
};

/**
 * Hook Query: Danh sách công ty mà Candidate đang theo dõi
 */
export const useMyFollowedCompanies = (
  params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  },
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: [
      "companies",
      "followed",
      params?.search,
      params?.page,
      params?.pageSize,
    ],
    queryFn: () => companyService.getMyFollowedCompanies(params),
    staleTime: 60 * 1000,
    enabled: options?.enabled ?? true,
  });
};

/**
 * Hook Mutation: Theo dõi công ty
 */
export const useFollowCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => companyService.followCompany(companyId),
    onSuccess: (_, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["companies", "followed"] });
      queryClient.invalidateQueries({
        queryKey: ["companies", "detail", companyId],
      });
      queryClient.invalidateQueries({ queryKey: ["job-postings", "detail"] });
    },
  });
};

/**
 * Hook Mutation: Hủy theo dõi công ty
 */
export const useUnfollowCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) => companyService.unfollowCompany(companyId),
    onSuccess: (_, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["companies", "followed"] });
      queryClient.invalidateQueries({
        queryKey: ["companies", "detail", companyId],
      });
      queryClient.invalidateQueries({ queryKey: ["job-postings", "detail"] });
    },
  });
};
