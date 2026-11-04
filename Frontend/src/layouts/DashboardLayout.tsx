import DashboardHeader from "@/components/common/DashboardHeader";
import DashboardSidebar from "@/components/common/DashboardSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ApplyJobModal } from "@/components/job/ApplyJobModal";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const DashboardLayout = () => {
  const user = useAuthStore((state) => state.user);
  const isCandidate = user?.roles?.some(
    (role) => role.toLowerCase() === "candidate",
  );

  return (
    <div className="font-sans text-text-main">
      <SidebarProvider className="flex min-h-screen flex-col">
        <DashboardHeader />

        <div className="flex flex-1">
          <DashboardSidebar />
          <SidebarInset className="h-[calc(100svh-4rem)] flex-1 overflow-x-hidden overflow-y-auto bg-secondary-light/30">
            <div className="flex-1 p-4 md:p-5 lg:p-6">
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* Global Apply Job Modal chỉ cần mount cho Candidate */}
      {isCandidate && <ApplyJobModal />}
    </div>
  );
};

export default DashboardLayout;
