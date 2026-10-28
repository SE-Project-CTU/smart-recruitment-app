import { createBrowserRouter, Navigate } from "react-router-dom";
import BaseLayout from "@/layouts/BaseLayout.tsx";
import DashboardLayout from "@/layouts/DashboardLayout";
import Page from "@/components/common/Page";
import {
  SignUp,
  SignIn,
  LandingPage,
  CandidateDashboard,
  UserProfile,
  BadRequestPage,
} from "@/pages";
import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute.tsx";
import { ProtectedRoute } from "./ProtectedRoute";
import { PATHS } from "@/constants/paths";
import SearchJobPage from "@/pages/candidate/SearchJobPage";
import SearchJob from "@/pages/SearchJobPublic";
import BookmarkCompanies from "@/pages/candidate/BookmarkCompanies";
import BookmarkJobs from "@/pages/candidate/BookmarkJobs";
import CandidateCvManagementPage from "@/pages/candidate/CandidateCvManagementPage";
import CandidateApplicationStatusPage from "@/pages/candidate/CandidateApplicationStatusPage";
import MatchedJobsPage from "@/pages/candidate/MatchedJobsPage";
import CompanyManagement from "@/pages/recruiter/CompanyManagement";
import CreateJobPage from "@/pages/recruiter/CreateJobPage";
import {
  CompanyListPage,
  CompanyDetailLayout,
  CompanyOverviewTab,
  CompanyMembersTab,
  CompanySettingsTab,
  CompanyInvitation,
  CompanyJoinRequestsTab,
} from "@/pages/recruiter/company";
import {
  RecruiterJobListPage,
  JobDetailPage,
  EditJobPage,
} from "@/pages/recruiter/job";
import { RecruiterCandidateListPage } from "@/pages/recruiter/candidate";
import CVBuilder from "@/pages/CVBuilder";
import CVBuilderDraft from "@/pages/CVBuilder_Draft";

const router = createBrowserRouter([
  // PUBLIC ROUTES
  {
    path: PATHS.HOME,
    element: <BaseLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: PATHS.SEARCH_JOB, element: <SearchJob /> },
    ],
  },

  {
    element: <PublicOnlyRoute redirectTo={PATHS.HOME} />,
    children: [
      { path: PATHS.SIGN_IN, element: <SignIn /> },
      { path: PATHS.SIGN_UP, element: <SignUp /> },
    ],
  },

  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: PATHS.CREATE_CV,
        element: <CVBuilder />,
      },
      {
        path: "/create-cv-draft",
        element: <CVBuilderDraft />,
      },
    ]
  },

  //CANDIDATE ROUTES
  {
    element: <ProtectedRoute allowRoles={["candidate"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/candidate",
            element: <Navigate to={PATHS.CANDIDATE.DASHBOARD} replace />,
          },
          {
            path: "/candidate/bookmarks",
            element: <Navigate to={PATHS.CANDIDATE.BOOKMARK_JOBS} replace />,
          },
          {
            path: PATHS.CANDIDATE.DASHBOARD,
            element: <CandidateDashboard />,
          },
          {
            path: PATHS.CANDIDATE.SEARCH_JOBS,
            element: <SearchJobPage />,
          },
          {
            path: PATHS.CANDIDATE.MATCHED_JOBS,
            element: <MatchedJobsPage />,
          },
          {
            path: PATHS.CANDIDATE.CV_MANAGEMENT,
            element: <CandidateCvManagementPage />,
          },
          {
            path: PATHS.CANDIDATE.APPLICATION_STATUS,
            element: <CandidateApplicationStatusPage />,
          },
          {
            path: PATHS.CANDIDATE.BOOKMARK_COMPANIES,
            element: <BookmarkCompanies />,
          },
          {
            path: PATHS.CANDIDATE.BOOKMARK_JOBS,
            element: <BookmarkJobs />,
          },
          {
            path: PATHS.CANDIDATE.COMPANY_REVIEWS,
            element: <Page title="Rì viu" />,
          },
          {
            path: PATHS.CANDIDATE.USER_PROFILE,
            element: <UserProfile />,
          },
          {
            path: PATHS.CANDIDATE.SETTINGS,
            element: <Page title="Cài đặt tài khoản" />,
          },
        ],
      },
    ],
  },

  // RECRUITER
  {
    element: <ProtectedRoute allowRoles={["recruiter", "hr"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/recruiter",
            element: <Navigate to={PATHS.RECRUITER.DASHBOARD} replace />,
          },
          {
            path: PATHS.RECRUITER.JOBS,
            element: <RecruiterJobListPage />,
          },
          {
            path: PATHS.RECRUITER.JOB_DETAIL,
            element: <JobDetailPage />,
          },
          {
            path: PATHS.RECRUITER.EDIT_JOB,
            element: <EditJobPage />,
          },
          {
            path: PATHS.RECRUITER.CREATE_JOB,
            element: <CreateJobPage />,
          },
          {
            path: PATHS.RECRUITER.CANDIDATES,
            element: <RecruiterCandidateListPage />,
          },
          {
            path: PATHS.RECRUITER.DASHBOARD,
            element: <Page title="Recruiter Dashboard Overview" />,
          },
          {
            path: PATHS.RECRUITER.COMPANY_MANAGEMENT,
            element: <CompanyManagement />,
            children: [
              {
                index: true,
                element: <CompanyListPage />,
              },
              {
                path: ":companyId",
                element: <CompanyDetailLayout />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="overview" replace />,
                  },
                  {
                    path: "overview",
                    element: <CompanyOverviewTab />,
                  },
                  {
                    path: "members",
                    element: <CompanyMembersTab />,
                  },
                  {
                    path: "settings",
                    element: <CompanySettingsTab />,
                  },
                  {
                    path: "invitations",
                    element: <CompanyJoinRequestsTab />,
                  },
                ],
              },
            ],
          },
          {
            path: PATHS.RECRUITER.COMPANY_INVITATION,
            element: <CompanyInvitation />,
          },
          {
            path: PATHS.RECRUITER.USER_PROFILE,
            element: <UserProfile />,
          },
        ],
      },
    ],
  },

  // ADMIN ROUTES
  {
    element: <ProtectedRoute allowRoles={["admin", "superadmin"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/admin",
            element: <Navigate to={PATHS.ADMIN.DASHBOARD} replace />,
          },
          {
            path: "/admin/aprove",
            element: <Navigate to={PATHS.ADMIN.APPROVE_COMPANY} replace />,
          },
          {
            path: PATHS.ADMIN.DASHBOARD,
            element: <Page title="Admin Dashboard Overview" />,
          },
          {
            path: PATHS.ADMIN.USER_PROFILE,
            element: <UserProfile />,
          },
          {
            path: PATHS.ADMIN.APPROVE_COMPANY,
            element: <Page title="Duyệt doanh nghiệp" />,
          },
          {
            path: PATHS.ADMIN.APPROVE_JD,
            element: <Page title="Duyệt tin tuyển dụng" />,
          },
        ],
      },
    ],
  },

  // {
  //   element: <ProtectedRoute />,
  //   children: [
  //     {
  //       path: PATHS.CREATE_CV,
  //       element: <CVBuilder />,
  //     },
  //   ],
  // },

  {
    path: PATHS.FORBIDDEN,
    element: (
      <BadRequestPage
        httpCode="403"
        title="Forbidden"
        description="Rất tiếc, bạn không có quyền truy cập vào khu vực này!"
      />
    ),
  },
  {
    path: PATHS.NOT_FOUND,
    element: <BadRequestPage />,
  },
]);

export default router;
