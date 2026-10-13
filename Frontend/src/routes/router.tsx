import { createBrowserRouter } from "react-router-dom";
import BaseLayout from "@/layouts/BaseLayout.tsx";
import Page from "@/components/Page.tsx";
import { SignUp, SignIn, LandingPage, NotFound } from "@/pages";
import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute.tsx";
import { ProtectedRoute } from "./ProtectedRoute";
import { PATHS } from "@/constants/paths";
import DashboardLayout from "@/layouts/DashboardLayout";

const router = createBrowserRouter([
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
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: PATHS.CANDIDATE.DASHBOARD,
            element: <Page title="this is CANDIDATE dashaboard" />,
          },
        ],
      },
      {
        path: PATHS.CREATE_CV,
        element: <Page title="you hit CV creator" />,
      },
    ],
  },
  { path: PATHS.NOT_FOUND, element: <NotFound /> },
]);

export default router;
