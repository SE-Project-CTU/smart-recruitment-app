import Header from "@/components/common/Header";
import { Outlet } from "react-router-dom";
import { ApplyJobModal } from "@/components/job/ApplyJobModal";
import { SignalRNotificationListener } from "@/components/notification/SignalRNotificationListener";

const BaseLayout = () => (
  <div className="font-sans text-text-main">
    <SignalRNotificationListener />
    <Header />
    <main className="bg-bg-white-blue">
      <Outlet />
    </main>
    <ApplyJobModal />
  </div>
);

export default BaseLayout;
