export const STORAGE_KEYS = {
  // Cookies
  ACCESS_TOKEN: "sh_access_token",
  REFRESH_TOKEN: "sh_refresh_token",

  // LocalStorage
  AUTH_USER: "sh_auth_user",
} as const;

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN_DAYS: 1,
  REFRESH_TOKEN_DAYS: 7,
} as const;
