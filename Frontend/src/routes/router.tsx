import { createBrowserRouter } from "react-router-dom";
import BaseLayout from "@/layouts/BaseLayout.tsx";
import DashboardLayout from "@/layouts/DashboardLayout.tsx";
import Page from "@/components/Page.tsx";
import { SignUp, SignIn, LandingPage, NotFound } from "@/pages";
import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute.tsx";
import { ProtectedRoute } from "@/routes/ProtectedRoute.tsx";
import { PATHS } from "@/constants/paths";

const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: <BaseLayout />,
    children: [{ index: true, element: <LandingPage /> }],
  },

  // chưa đăng nhập
  {
    element: <PublicOnlyRoute redirectTo={PATHS.HOME} />,
    children: [
      { path: PATHS.SIGN_IN, element: <SignIn /> },
      { path: PATHS.SIGN_UP, element: <SignUp /> },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      // dashboard Layout Wrapper
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
            path: PATHS.CANDIDATE.BOOKMARKS,
            element: <Page title="Mục đã lưu (Việc làm & Công ty)" />,
          },
          {
            path: PATHS.CANDIDATE.SETTINGS,
            element: <Page title="Cài đặt tài khoản Candidate" />,
          },

          // --- Recruiter Routes ---
          {
            path: PATHS.RECRUITER.DASHBOARD,
            element: <Page title="Recruiter Dashboard Overview" />,
          },

          // --- Admin Routes ---
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
            element: <Page title="Duyệt tin tuyển dụng (JD)" />,
          },
        ],
      },
    ],
  },
  {
    path: PATHS.CREATE_CV,
    element: <Page title="Trình tạo CV (Full Screen)" />,
  },
  { path: PATHS.NOT_FOUND, element: <NotFound /> },
]);

export default router;
