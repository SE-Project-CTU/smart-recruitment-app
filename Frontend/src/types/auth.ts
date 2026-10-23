export type UserRole = "Candidate" | "Recruiter" | "Admin";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LogoutRequest {
  refreshToken?: string | null;
  allSessions?: boolean;
}

export interface RefreshRequest {
  refreshToken?: string | null;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  status: string;
  avatarUrl: string | null;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserAccount;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
}

export interface RegisterResult {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  roles: string[];
  status: string;
  createdAt: string;
}

export interface RefreshResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
  correlationId: string;
}
