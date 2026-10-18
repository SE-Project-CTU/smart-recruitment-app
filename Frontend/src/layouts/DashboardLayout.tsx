import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="font-sans text-text-main">
      <SidebarProvider className="flex min-h-screen flex-col">
        <DashboardHeader />

        <div className="flex flex-1">
          <DashboardSidebar />
          <SidebarInset className="min-h-[calc(100svh-4rem)] flex-1">
            <div className="flex-1 overflow-hidden p-4 md:p-5 lg:p-6">
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
