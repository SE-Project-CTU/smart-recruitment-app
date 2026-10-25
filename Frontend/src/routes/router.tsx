import { createBrowserRouter } from "react-router-dom";
import BaseLayout from "@/layouts/BaseLayout.tsx";
import DashboardLayout from "@/layouts/DashboardLayout";
import Page from "@/components/Page.tsx";
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
import CVBuilder from "@/pages/CVBuilder";

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

  //CANDIDATE ROUTES
  {
    element: <ProtectedRoute allowRoles={["candidate"]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
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
            element: <Page title="Việc làm phù hợp" />,
          },
          {
            path: PATHS.CANDIDATE.CV_MANAGEMENT,
            element: <Page title="Quản lý CV" />,
          },
          {
            path: PATHS.CANDIDATE.APPLICATION_STATUS,
            element: <Page title="Trạng thái hồ sơ" />,
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
            path: PATHS.RECRUITER.DASHBOARD,
            element: <Page title="Recruiter Dashboard Overview" />,
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

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: PATHS.CREATE_CV,
        element: <Page title="Trình tạo CV (Full Screen)" />,
      },
    ],
  },

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
