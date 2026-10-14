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
    APPLICATION_STATUS: "/candidate/application-status",
    BOOKMARK_JOBS: "/candidate/bookmarks/jobs",
    BOOKMARK_COMPANIES: "/candidate/bookmarks/companies",
    COMPANY_REVIEWS: "/candidate/reviews",
    SETTINGS: "/candidate/settings",
  },

  RECRUITER: {
    DASHBOARD: "/recruiter/dashboard",
  },

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    APPROVE_COMPANY: "/admin/aprove/company",
    APPROVE_JD: "/admin/aprove/jd",
  },

  // other
  CREATE_CV: "/create-cv",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "*",
} as const;
