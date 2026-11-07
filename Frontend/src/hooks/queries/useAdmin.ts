import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/api/errorHandler";
import type {
  AdminUserFilterParams,
  UpdateUserStatusPayload,
  AdminCompanyFilterParams,
  ReviewCompanyVerificationPayload,
  AdminJobPostingFilterParams,
  ReviewJobModerationPayload,
  SendSystemAlertPayload,
} from "@/types/admin";

export const adminKeys = {
  all: ["admin"] as const,
  dashboard: (params?: { from?: string; to?: string }) =>
    [...adminKeys.all, "dashboard", params] as const,
  users: (params?: AdminUserFilterParams) =>
    [...adminKeys.all, "users", params] as const,
  companies: (params?: AdminCompanyFilterParams) =>
    [...adminKeys.all, "companies", params] as const,
  companyDetail: (id?: string) =>
    [...adminKeys.all, "companies", "detail", id] as const,
  jobPostings: (params?: AdminJobPostingFilterParams) =>
    [...adminKeys.all, "job-postings", params] as const,
  jobPostingDetail: (id?: string) =>
    [...adminKeys.all, "job-postings", "detail", id] as const,
  industryGroups: (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }) => [...adminKeys.all, "industry-groups", params] as const,
  industries: (params?: {
    groupId?: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }) => [...adminKeys.all, "industries", params] as const,
  provinces: (params?: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) => [...adminKeys.all, "provinces", params] as const,
  wards: (params?: {
    provinceId?: string;
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) => [...adminKeys.all, "wards", params] as const,
  skills: (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }) => [...adminKeys.all, "skills", params] as const,
  cvTemplates: (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }) => [...adminKeys.all, "cv-templates", params] as const,
};

// ==========================================
// 1. DASHBOARD QUERIES
// ==========================================

export const useAdminDashboardOverview = (params?: {
  from?: string;
  to?: string;
}) => {
  return useQuery({
    queryKey: adminKeys.dashboard(params),
    queryFn: () => adminService.getDashboardOverview(params),
    staleTime: 60 * 1000, // 1 phút
  });
};

// ==========================================
// 2. USERS
// ==========================================

export const useAdminUsers = (params?: AdminUserFilterParams) => {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminService.getUsers(params),
    staleTime: 30 * 1000,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserStatusPayload;
    }) => adminService.updateUserStatus(id, payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "users"] });
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "dashboard"],
      });
      const isLocked = result.status.toLowerCase() === "locked";
      toast.success(
        isLocked
          ? "Đã khóa tài khoản và thu hồi các phiên đăng nhập thành công!"
          : "Đã mở khóa tài khoản thành công!",
      );
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(
          err,
          "Không thể thay đổi trạng thái tài khoản. Vui lòng thử lại.",
        ),
      );
    },
  });
};

// ==========================================
// 3. COMPANIES
// ==========================================

export const useAdminCompanies = (params?: AdminCompanyFilterParams) => {
  return useQuery({
    queryKey: adminKeys.companies(params),
    queryFn: () => adminService.getCompanies(params),
    staleTime: 30 * 1000,
  });
};

export const useAdminCompanyDetail = (id?: string) => {
  return useQuery({
    queryKey: adminKeys.companyDetail(id),
    queryFn: () => adminService.getCompanyDetail(id!),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
};

export const useVerifyCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReviewCompanyVerificationPayload;
    }) => adminService.reviewCompanyVerification(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "companies"],
      });
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "dashboard"],
      });
      const isApproved =
        vars.payload.verificationStatus?.toUpperCase() === "VERIFIED";
      toast.success(
        isApproved
          ? "Đã phê duyệt doanh nghiệp thành công!"
          : "Đã từ chối xét duyệt và gửi thông báo tới doanh nghiệp.",
      );
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(
          err,
          "Không thể cập nhật xét duyệt doanh nghiệp. Vui lòng thử lại.",
        ),
      );
    },
  });
};

// ==========================================
// 4. JOB POSTINGS
// ==========================================

export const useAdminJobPostings = (params?: AdminJobPostingFilterParams) => {
  return useQuery({
    queryKey: adminKeys.jobPostings(params),
    queryFn: () => adminService.getJobPostings(params),
    staleTime: 30 * 1000,
  });
};

export const useAdminJobPostingDetail = (id?: string) => {
  return useQuery({
    queryKey: adminKeys.jobPostingDetail(id),
    queryFn: () => adminService.getJobPostingDetail(id!),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
};

export const useModerateJobPosting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReviewJobModerationPayload;
    }) => adminService.reviewJobModeration(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "job-postings"],
      });
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "dashboard"],
      });
      const isApproved = vars.payload.status?.toUpperCase() === "PUBLISHED";
      toast.success(
        isApproved
          ? "Đã duyệt và xuất bản tin tuyển dụng thành công!"
          : "Đã từ chối tin tuyển dụng và gửi lý do phản hồi cho nhà tuyển dụng.",
      );
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(
          err,
          "Không thể kiểm duyệt tin tuyển dụng. Vui lòng thử lại.",
        ),
      );
    },
  });
};

// ==========================================
// 5. MASTER CATALOGS
// ==========================================

export const useAdminIndustryGroups = (params?: {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: adminKeys.industryGroups(params),
    queryFn: () => adminService.getIndustryGroups(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateIndustryGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) =>
      adminService.createIndustryGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "industry-groups"],
      });
      toast.success("Thêm nhóm ngành mới thành công!");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(err, "Không thể tạo nhóm ngành. Vui lòng thử lại."),
      );
    },
  });
};

export const useUpdateIndustryGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string; isActive?: boolean };
    }) => adminService.updateIndustryGroup(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "industry-groups"],
      });
      toast.success("Cập nhật nhóm ngành thành công!");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(
          err,
          "Không thể cập nhật nhóm ngành. Vui lòng thử lại.",
        ),
      );
    },
  });
};

export const useAdminIndustries = (params?: {
  groupId?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: adminKeys.industries(params),
    queryFn: () => adminService.getIndustries(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateIndustry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { groupId: string; name: string }) =>
      adminService.createIndustry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "industries"],
      });
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "industry-groups"],
      });
      toast.success("Thêm ngành nghề mới thành công!");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(err, "Không thể tạo ngành nghề. Vui lòng thử lại."),
      );
    },
  });
};

export const useUpdateIndustry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { groupId?: string; name?: string; isActive?: boolean };
    }) => adminService.updateIndustry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "industries"],
      });
      toast.success("Cập nhật ngành nghề thành công!");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(
          err,
          "Không thể cập nhật ngành nghề. Vui lòng thử lại.",
        ),
      );
    },
  });
};

export const useAdminProvinces = (params?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: adminKeys.provinces(params),
    queryFn: () => adminService.getProvinces(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProvince = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      status?: string;
      isCentrallyGoverned?: boolean;
    }) => adminService.createProvince(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "provinces"],
      });
      toast.success("Thêm Tỉnh/Thành phố mới thành công!");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(
          err,
          "Không thể tạo Tỉnh/Thành phố. Vui lòng thử lại.",
        ),
      );
    },
  });
};

export const useUpdateProvince = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        name?: string;
        status?: string;
        isCentrallyGoverned?: boolean;
      };
    }) => adminService.updateProvince(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "provinces"],
      });
      toast.success("Cập nhật Tỉnh/Thành phố thành công!");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(
          err,
          "Không thể cập nhật Tỉnh/Thành phố. Vui lòng thử lại.",
        ),
      );
    },
  });
};

export const useAdminWards = (params?: {
  provinceId?: string;
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: adminKeys.wards(params),
    queryFn: () => adminService.getWards(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateWard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      provinceId: string;
      name: string;
      status?: string;
      isCommune?: boolean;
    }) => adminService.createWard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "wards"] });
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "provinces"],
      });
      toast.success("Thêm Phường/Xã mới thành công!");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(err, "Không thể tạo Phường/Xã. Vui lòng thử lại."),
      );
    },
  });
};

export const useUpdateWard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        provinceId?: string;
        name?: string;
        status?: string;
        isCommune?: boolean;
      };
    }) => adminService.updateWard(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "wards"] });
      toast.success("Cập nhật Phường/Xã thành công!");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(
          err,
          "Không thể cập nhật Phường/Xã. Vui lòng thử lại.",
        ),
      );
    },
  });
};

export const useAdminSkills = (params?: {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: adminKeys.skills(params),
    queryFn: () => adminService.getSkills(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) => adminService.createSkill(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "skills"] });
      toast.success("Thêm kỹ năng mới thành công!");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(err, "Không thể tạo kỹ năng. Vui lòng thử lại."),
      );
    },
  });
};

export const useUpdateSkill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string; isActive?: boolean };
    }) => adminService.updateSkill(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "skills"] });
      toast.success("Cập nhật kỹ năng thành công!");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(
          err,
          "Không thể cập nhật kỹ năng. Vui lòng thử lại.",
        ),
      );
    },
  });
};

export const useAdminCvTemplates = (params?: {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: adminKeys.cvTemplates(params),
    queryFn: () => adminService.getCvTemplates(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateCvTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string; description?: string; isActive?: boolean };
    }) => adminService.updateCvTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "cv-templates"],
      });
      toast.success("Cập nhật mẫu CV thành công!");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(err, "Không thể cập nhật mẫu CV. Vui lòng thử lại."),
      );
    },
  });
};

// ==========================================
// 6. SYSTEM ALERTS
// ==========================================

export const useSendSystemAlert = () => {
  return useMutation({
    mutationFn: (payload: SendSystemAlertPayload) =>
      adminService.sendSystemAlert(payload),
    onSuccess: (data) => {
      toast.success(data?.message || "Phát thông báo hệ thống thành công!");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(
          err,
          "Không thể phát thông báo hệ thống. Vui lòng thử lại.",
        ),
      );
    },
  });
};

