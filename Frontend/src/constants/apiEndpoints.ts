export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/Auth/login",
    REGISTER_CANDIDATE: "/api/v1/Auth/register",
    REGISTER_RECRUITER: "/api/v1/Auth/register/recruiter",
    REFRESH: "/api/v1/Auth/refresh",
    LOGOUT: "/api/v1/Auth/logout",
  },
  ACCOUNT: {
    GET_ME: "/api/v1/Account/me",
    UPDATE_ME: "/api/v1/Account/me",
    CHANGE_PASSWORD: "/api/v1/Account/change-password",
  },
  MEDIA: {
    UPLOAD_IMAGE: "/api/v1/media/upload/image",
    UPLOAD_PDF: "/api/v1/media/upload/pdf",
    MEDIA_BY_ID: (id: string) => `/api/v1/media/${id}`,
  },
} as const;
