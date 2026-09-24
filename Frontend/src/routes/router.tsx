import { createBrowserRouter } from "react-router-dom";
import BaseLayout from "@/layouts/BaseLayout.tsx";
import Page from "@/components/Page.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <BaseLayout />,
    children: [
      { index: true, element: <Page title="Landing page" /> },
      { path: "login", element: <Page title="Trang Đăng nhập" /> },
      {
        path: "candidate/cv-builder",
        element: <Page title="Tạo  CV" />,
      },
      {
        path: "employer/applicants",
        element: <Page title="HR" />,
      },
      { path: "*", element: <Page title="404" /> },
    ],
  },
]);

export default router;
