export const PATHS = {
  // Public Routes
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  SEARCH_JOB: "/search-job",

  //candidateee
  CANDIDATE: {
    DASHBOARD: "/candidate/dashboard",
    SEARCH_JOBS: "/candidate/search",
    MATCHED_JOBS: "/candidate/matched-jobs",
    CV_MANAGEMENT: "/candidate/cv-management",
    APPLICATION_STATUS: "/candidate/application-status",
    BOOKMARK_JOBS: "/candidate/bookmarks/jobs",
    BOOKMARK_COMPANIES: "/candidate/bookmarks/companies",
    COMPANY_REVIEWS: "/candidate/reviews",
    USER_PROFILE: "/candidate/profile",
    SETTINGS: "/candidate/settings",
  },

  RECRUITER: {
    DASHBOARD: "/recruiter/dashboard",
    COMPANY_MANAGEMENT: "/recruiter/company-management",
    COMPANY_INVITATION: "/recruiter/company-invitation",
    USER_PROFILE: "/recruiter/profile",
  },

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USER_PROFILE: "/admin/profile",
    APPROVE_COMPANY: "/admin/aprove/company",
    APPROVE_JD: "/admin/aprove/jd",
  },

  // other
  CREATE_CV: "/create-cv",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "*",
} as const;
