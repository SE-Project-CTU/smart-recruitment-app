export interface CookieOptions {
  expires?: Date | number; // Number of days or Date object
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

/**
 * Retrieve a cookie value by key name.
 */
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
 * Set a cookie with optional expiration and configuration.
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
      expiresDate.setTime(expiresDate.getTime() + expires * 24 * 60 * 60 * 1000);
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
 * Remove a cookie by name.
 */
export function removeCookie(name: string, path: string = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}

export const AUTH_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

/**
 * Convenience methods for auth tokens
 */
export function getAccessToken(): string | null {
  return getCookie(AUTH_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  return getCookie(AUTH_KEYS.REFRESH_TOKEN);
}

export function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  refreshTokenExpiresAt?: string,
): void {
  // Set accessToken (e.g. 1 day default)
  setCookie(AUTH_KEYS.ACCESS_TOKEN, accessToken, { expires: 1 });

  // Set refreshToken using expiration date from backend if available, or default to 7 days
  const refreshExpires = refreshTokenExpiresAt
    ? new Date(refreshTokenExpiresAt)
    : 7;
  setCookie(AUTH_KEYS.REFRESH_TOKEN, refreshToken, { expires: refreshExpires });
}

export function clearAuthCookies(): void {
  removeCookie(AUTH_KEYS.ACCESS_TOKEN);
  removeCookie(AUTH_KEYS.REFRESH_TOKEN);
}
