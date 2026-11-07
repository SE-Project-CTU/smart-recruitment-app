import Header from "@/components/common/Header";
import { Outlet } from "react-router-dom";
import { ApplyJobModal } from "@/components/job/ApplyJobModal";

const BaseLayout = () => (
  <div className="font-sans text-text-main">
    <Header />
    <main className="bg-bg-white-blue">
      <Outlet />
    </main>
    <ApplyJobModal />
  </div>
);

export default BaseLayout;
