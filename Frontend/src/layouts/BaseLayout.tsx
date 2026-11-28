import Header from "@/components/common/Header";
import { Outlet } from "react-router-dom";

const BaseLayout = () => (
  <div className="font-sans text-text-main">
    <Header />
    <main className="bg-bg-white-blue">
      <Outlet />
    </main>
  </div>
);

/** Khung căn giữa chuẩn cho các trang Candidate bên dưới fixed Header của BaseLayout */
export const CandidatePageLayout = () => (
  <div className="min-h-screen bg-bg px-4 pt-24 pb-12 sm:px-6 sm:pt-28 lg:px-8">
    <div className="mx-auto w-full max-w-7xl">
      <Outlet />
    </div>
  </div>
);

export default BaseLayout;
