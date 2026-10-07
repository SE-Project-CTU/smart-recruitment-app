import { createBrowserRouter } from "react-router-dom";
import BaseLayout from "@/layouts/BaseLayout.tsx";
import Page from "@/components/Page.tsx";
import LandingPage from "@/pages/LandingPage";
import SignIn from "@/pages/SignIn";

const router = createBrowserRouter([
  {
    path: "/",
    element: <BaseLayout />,
    children: [{ index: true, element: <LandingPage /> }],
  },
  { path: "/sign-in", element: <SignIn /> },
  { path: "*", element: <Page title="404" /> },
]);

export default router;
