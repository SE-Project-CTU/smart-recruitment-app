export interface LoginRequest {
  email: string;
  password: string;
}

export interface LogoutRequest {
  refreshToken?: string | null;
  allSessions?: boolean;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  status: string;
}

export interface LoginResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
}

export interface RefreshResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
  correlationId: string;
}
