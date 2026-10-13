import { Outlet } from "react-router-dom";

const DashboardLayout = () => (
  <div className="font-sans text-text-main">
    <main className="bg-bg-white-blue">
      <Outlet />
    </main>
  </div>
);

export default DashboardLayout;
