export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/Auth/login",
    REGISTER_CANDIDATE: "/Auth/register",
    REGISTER_RECRUITER: "/Auth/register/recruiter",
    REFRESH: "/Auth/refresh",
    LOGOUT: "/Auth/logout",
  },
  ACCOUNT: {
    GET_ME: "/Account/me",
    UPDATE_ME: "/Account/me",
    CHANGE_PASSWORD: "/Account/change-password",
  },
  MEDIA: {
    UPLOAD_IMAGE: "/media/upload/image",
    UPLOAD_PDF: "/media/upload/pdf",
    DETAIL: (id: string) => `/media/${id}`,
    DELETE: (id: string) => `/media/${id}`,
  },
} as const;
