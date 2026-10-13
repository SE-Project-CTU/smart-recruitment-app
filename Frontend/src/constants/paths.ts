export const PATHS = {
  // Public Routes
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",

  //candidateee
  CANDIDATE: {
    DASHBOARD: "/candidate/dashboard",
    MATCHED_JOBS: "/candidate/matched-jobs",
    CV_MANAGEMENT: "/candidate/cv-management",
    APPLICATION_STATUS: "/candidate/application_status",
    BOOKMARKS: "/candidate/bookmarks",
    SETTINGS: "/candidate/settings",
  },

  RECRUITER: {
    DASHBOARD: "/recruiter/dashboard",
  },

  ADMIN: {
    DASHBOARD: "admin/dashboard",
  },

  // other
  CREATE_CV: "/create-cv",
  NOT_FOUND: "*",
} as const;
