import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import type { LoginRequest, RegisterRequest } from "@/types/auth";
import { accountService } from "@/services/accountService";
import { useEffect } from "react";
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "@/types/account";

/**
 * Hook Mutation: Xử lý Đăng nhập
 *
 * @example
 * ```tsx
 * const { mutateAsync: login, isPending } = useLogin();
 * await login({ email, password });
 * ```
 */
export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const response = await authService.login(payload);
      return response.data;
    },
    onSuccess: (data) => {
      // Tự động lưu vào Zustand store, Cookies và LocalStorage
      setAuth(data);
    },
  });
};

/**
 * Hook Mutation: Xử lý Đăng ký Ứng viên (Candidate)
 *
 * @example
 * ```tsx
 * const { mutateAsync: registerCandidate, isPending } = useRegisterCandidate();
 * await registerCandidate({ fullName, email, phone, password });
 * ```
 */
export const useRegisterCandidate = () => {
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const response = await authService.registerCandidate(payload);
      return response.data;
    },
  });
};

/**
 * Hook Mutation: Xử lý Đăng ký Nhà tuyển dụng (Recruiter)
 *
 * @example
 * ```tsx
 * const { mutateAsync: registerRecruiter, isPending } = useRegisterRecruiter();
 * await registerRecruiter({ fullName, email, phone, password });
 * ```
 */
export const useRegisterRecruiter = () => {
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const response = await authService.registerRecruiter(payload);
      return response.data;
    },
  });
};

/**
 * Hook Mutation: Xử lý Đăng xuất
 *
 * @example
 * ```tsx
 * const { mutateAsync: logout, isPending } = useLogout();
 * await logout(false);
 * ```
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const logoutAction = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async (allSessions: boolean = false) => {
      await logoutAction(allSessions);
    },
    onSuccess: () => {
      // Xóa toàn bộ cache dữ liệu của user cũ trong React Query
      queryClient.clear();
    },
  });
};

export const useGetMe = () => {
  const updateUser = useAuthStore((state) => state.updateUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: ["account", "me"],
    queryFn: async () => {
      const response = await accountService.getMe();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // cache 5 phút nhé
  });

  useEffect(() => {
    if (query.data) {
      updateUser(query.data);
    }
  }, [query.data, updateUser]);

  return query;
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: async (payload: UpdateProfileRequest) => {
      const response = await accountService.updateAccount(payload);
      return response.data;
    },
    onSuccess: (updatedData) => {
      updateUser(updatedData);
      queryClient.invalidateQueries({ queryKey: ["account", "me"] });
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async (payload: ChangePasswordRequest) => {
      return await accountService.changePassword(payload);
    },
    onSuccess: (_, variables) => {
      if (variables.revokeAllSessions !== false) {
        clearAuth();
        queryClient.clear();
      }
    },
  });
};
