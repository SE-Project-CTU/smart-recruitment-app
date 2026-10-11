import { createBrowserRouter } from "react-router-dom";
import BaseLayout from "@/layouts/BaseLayout.tsx";
import Page from "@/components/Page.tsx";
import { SignUp, SignIn, LandingPage } from "@/pages";
import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <BaseLayout />,
    children: [{ index: true, element: <LandingPage /> }],
  },
  {
    element: <PublicOnlyRoute redirectTo="/" />,
    children: [
      { path: "/sign-in", element: <SignIn /> },
      { path: "/sign-up", element: <SignUp /> },
    ],
  },
  { path: "*", element: <Page title="404" /> },
]);

export default router;
