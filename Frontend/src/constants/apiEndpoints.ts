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
  COMPANY: {
    LIST: "/companies",
    DETAIL: (id: string) => `/companies/${id}`,
    CREATE: "/companies",
    UPDATE: (id: string) => `/companies/${id}`,
    MEMBERS: (id: string) => `/companies/${id}/members`,
    INVITATIONS: (id: string) => `/companies/${id}/invitations`,
    MY_INVITATIONS: "/me/company-invitations",
    ACCEPT_INVITATION: (id: string) => `/company-invitations/${id}/accept`,
    REJECT_INVITATION: (id: string) => `/company-invitations/${id}/reject`,
    JOIN_REQUESTS: (id: string) => `/companies/${id}/join-requests`,
    TRANSFER_OWNERSHIP: (id: string) => `/companies/${id}/ownership`,
  },
} as const;
