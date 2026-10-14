import { createBrowserRouter } from "react-router-dom";
import BaseLayout from "@/layouts/BaseLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import Page from "@/components/Page";
import { SignUp, SignIn, LandingPage } from "@/pages";
import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PATHS } from "@/constants/paths";
import BadRequestPage from "@/pages/BadRequestPage";

const router = createBrowserRouter([
  // PUBLIC ROUTES
  {
    path: PATHS.HOME,
    element: <BaseLayout />,
    children: [{ index: true, element: <LandingPage /> }],
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
            element: <Page title="Candidate Dashboard Overview" />,
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
            element: <Page title="Mục đã lưu 1" />,
          },
          {
            path: PATHS.CANDIDATE.BOOKMARK_JOBS,
            element: <Page title="Mục đã lưu 2" />,
          },
          {
            path: PATHS.CANDIDATE.COMPANY_REVIEWS,
            element: <Page title="Mục đã lưu 2" />,
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
