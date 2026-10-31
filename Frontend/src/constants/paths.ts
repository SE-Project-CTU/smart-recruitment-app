export const PATHS = {
  // Public Routes
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  SEARCH_JOB: "/search-job",

  // Root aliases for CV flow
  CREATE_CV: "/candidate/cv-templates",
  EDIT_CV: "/candidate/edit-cv",

  //candidateee
  CANDIDATE: {
    DASHBOARD: "/candidate/dashboard",
    SEARCH_JOBS: "/candidate/search",
    MATCHED_JOBS: "/candidate/matched-jobs",
    CV_MANAGEMENT: "/candidate/cv-management",
    CV_TEMPLATES: "/candidate/cv-templates",
    EDIT_CV: "/candidate/edit-cv",
    SAVE_CV_SUCCESS: "/candidate/save-cv-success",
    APPLICATION_STATUS: "/candidate/application-status",
    BOOKMARK_JOBS: "/candidate/bookmarks/jobs",
    BOOKMARK_COMPANIES: "/candidate/bookmarks/companies",
    COMPANY_REVIEWS: "/candidate/reviews",
    USER_PROFILE: "/candidate/profile",
    SETTINGS: "/candidate/settings",
  },

  RECRUITER: {
    DASHBOARD: "/recruiter/dashboard",
    JOBS: "/recruiter/jobs",
    CREATE_JOB: "/recruiter/jobs/create",
    JOB_DETAIL: "/recruiter/jobs/:id",
    EDIT_JOB: "/recruiter/jobs/:id/edit",
    CANDIDATES: "/recruiter/candidates",
    COMPANY_MANAGEMENT: "/recruiter/company-management",
    COMPANAY_MANAGEMENT_OVERVIEW:
      "/recruiter/company-management/:companyId/overview",
    COMPANAY_MANAGEMENT_MEMBERS:
      "/recruiter/company-management/:companyId/members",
    COMPANAY_MANAGEMENT_SETTINGS:
      "/recruiter/company-management/:companyId/settings",
    COMPANAY_MANAGEMENT_INVITATIONS:
      "/recruiter/company-management/:companyId/invitations",
    COMPANY_INVITATION: "/recruiter/company-invitation",
    USER_PROFILE: "/recruiter/profile",
  },

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USER_PROFILE: "/admin/profile",
    APPROVE_COMPANY: "/admin/aprove/company",
    APPROVE_JD: "/admin/aprove/jd",
  },

  FORBIDDEN: "forbidden",
  NOT_FOUND: "*",
} as const;
