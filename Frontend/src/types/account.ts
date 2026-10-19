import type { UserAccount } from "./auth";

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export type UpdateProfileResult = Omit<UserAccount, "createdAt">;

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  revokeAllSessions?: boolean;
}

export interface ChangePasswordResult {
  message: string;
}
