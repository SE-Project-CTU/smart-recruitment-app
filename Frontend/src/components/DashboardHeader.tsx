import { Link } from "react-router-dom";
import { Bell, ChevronDown, FileText } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SmartHire_default } from "@/assets/images/logo";
import { useAuthStore } from "@/stores/authStore";
import { PATHS } from "@/constants/paths";
import { getLoremAvt } from "@/utils/helper";

function DashboardHeader() {
  const { user } = useAuthStore();

  const displayName = user?.fullName || "Người dùng";
  const displayEmail = user?.email || "user@smarthire.com";

  return (
    <header className="border-border/ sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-bg px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        <Link to={PATHS.HOME} className="flex items-center">
          <img src={SmartHire_default} alt="SmartHire" className="h-8 w-auto" />
        </Link>
        <SidebarTrigger className="h-9 w-9 rounded-lg hover:bg-slate-100" />
      </div>

      <div className="flex items-center gap-4">
        <Link
          to={PATHS.CREATE_CV}
          className="hidden items-center gap-2 rounded-full bg-[#1e293b] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-800 sm:flex"
        >
          <FileText className="size-3.5" />
          <span>Tạo CV</span>
        </Link>

        <button
          type="button"
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3 border-l border-border/40 pl-3">
          <img
            src={getLoremAvt(displayName)}
            alt={displayName}
            className="size-9 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div className="hidden flex-col text-left md:flex">
            <span className="text-xs leading-tight font-semibold text-slate-800">
              {displayName}
            </span>
            <span className="text-[11px] leading-tight text-text-muted">
              {displayEmail}
            </span>
          </div>
          <ChevronDown className="hidden size-4 text-slate-400 md:block" />
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
