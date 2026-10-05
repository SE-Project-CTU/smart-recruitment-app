import { createBrowserRouter } from "react-router-dom";
import BaseLayout from "@/layouts/BaseLayout.tsx";
import Page from "@/components/Page.tsx";
import LandingPage from "@/pages/LandingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <BaseLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <Page title="Trang Đăng nhập" /> },
      { path: "*", element: <Page title="404" /> },
    ],
  },
]);

export default router;
