import { STORAGE_KEYS, TOKEN_EXPIRY } from "@/constants/storage";

export interface CookieOptions {
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * Lưu Cookie với cấu hình tùy chọn
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  if (typeof document === "undefined") return;

  const {
    expires,
    path = "/",
    domain,
    secure = window.location.protocol === "https:",
    sameSite = "Lax",
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    let expiresDate: Date;
    if (typeof expires === "number") {
      expiresDate = new Date();
      expiresDate.setTime(
        expiresDate.getTime() + expires * 24 * 60 * 60 * 1000,
      );
    } else {
      expiresDate = expires;
    }
    cookieString += `; expires=${expiresDate.toUTCString()}`;
  }

  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;
  if (secure) cookieString += `; Secure`;
  if (sameSite) cookieString += `; SameSite=${sameSite}`;

  document.cookie = cookieString;
}

/**
 * Xóa Cookie theo tên
 */
export function removeCookie(name: string, path: string = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}

// ----------------------------------------------------------------------
// Các hàm tiện ích dành riêng cho Auth Tokens
// ----------------------------------------------------------------------

export function getAccessToken(): string | null {
  return getCookie(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  return getCookie(STORAGE_KEYS.REFRESH_TOKEN);
}

export function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  refreshTokenExpiresAt?: string,
): void {
  setCookie(STORAGE_KEYS.ACCESS_TOKEN, accessToken, {
    expires: TOKEN_EXPIRY.ACCESS_TOKEN_DAYS,
  });

  const refreshExpires = refreshTokenExpiresAt
    ? new Date(refreshTokenExpiresAt)
    : TOKEN_EXPIRY.REFRESH_TOKEN_DAYS;

  setCookie(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, {
    expires: refreshExpires,
  });
}

export function clearAuthCookies(): void {
  removeCookie(STORAGE_KEYS.ACCESS_TOKEN);
  removeCookie(STORAGE_KEYS.REFRESH_TOKEN);
}
