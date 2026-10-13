import DashboardHeader from "@/components/DashboardHeader";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => (
  <div className="font-sans text-text-main">
    <DashboardHeader />
    <main className="bg-bg-white-blue">
      <Outlet />
    </main>
  </div>
);

export default DashboardLayout;
