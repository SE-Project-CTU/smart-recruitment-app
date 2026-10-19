import type { UserAccount } from "./auth";

export interface GetMeResult {
  data: UserAccount;
  meta: Record<string, unknown>;
  correlationId: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  revokeAllSessions?: boolean;
}
