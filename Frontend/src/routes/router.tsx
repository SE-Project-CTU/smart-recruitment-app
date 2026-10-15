import { createBrowserRouter } from "react-router-dom";
import BaseLayout from "@/layouts/BaseLayout.tsx";
import { SignUp, SignIn, LandingPage, NotFound } from "@/pages";
import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute.tsx";
import { ProtectedRoute } from "./ProtectedRoute";
import CVBuilder from "@/pages/CVBuilder";

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
  {
    element: <ProtectedRoute />,
    children: [{ path: "/create-cv", element: <CVBuilder /> }],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
