import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UpdateProfileResult,
} from "@/types/account";
import type { ApiResponse, UserAccount } from "@/types/auth";

export const accountService = {
  getMe(): Promise<ApiResponse<UserAccount>> {
    return axiosClient.get<never, ApiResponse<UserAccount>>(
      API_ENDPOINTS.ACCOUNT.GET_ME,
    );
  },

  updateAccount(
    payload: UpdateProfileRequest,
  ): Promise<ApiResponse<UpdateProfileResult>> {
    return axiosClient.patch<never, ApiResponse<UpdateProfileResult>>(
      API_ENDPOINTS.ACCOUNT.UPDATE_ME,
      payload,
    );
  },

  changePassword(payload: ChangePasswordRequest): Promise<void> {
    return axiosClient.post<never, void>(
      API_ENDPOINTS.ACCOUNT.CHANGE_PASSWORD,
      payload,
    );
  },
};
