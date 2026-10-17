import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  FilePlus,
  FileText,
  Home,
  ListCheck,
  LogOut,
  PlusCircle,
  UserRound,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SmartHire_default } from "@/assets/images/logo";
import { useAuthStore } from "@/stores/authStore";
import { PATHS } from "@/constants/paths";
import { getLoremAvt, getProfilePathByRole } from "@/utils/helper";
import Button from "./Button";
import {
  Menu,
  MenuTrigger,
  MenuPanel,
  MenuGroup,
  MenuItem,
  MenuSeparator,
} from "@/components/animate-ui/components/base/menu";
import { useLogout } from "@/hooks/queries/useAuth";

function DashboardHeader() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  const displayName = user?.fullName || "Người dùng";
  const displayEmail = user?.email || "user@smarthire.com";
  const primaryRole = user?.roles?.[0]?.toLowerCase() || "candidate";

  const handleLogout = async () => {
    try {
      await logout(false);
      navigate(PATHS.SIGN_IN);
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    }
  };

  const renderRoleActionButton = () => {
    switch (primaryRole) {
      case "candidate":
        return (
          <Button
            icon={FileText}
            onClick={() => navigate(PATHS.CREATE_CV)}
            className="hidden! text-xs! md:flex!"
          >
            Tạo CV
          </Button>
        );

      case "recruiter":
      case "hr":
        return (
          <Button
            icon={PlusCircle}
            onClick={() => navigate(PATHS.RECRUITER.DASHBOARD)}
            className="hidden! text-xs! md:flex!"
          >
            Đăng tin tuyển dụng
          </Button>
        );

      case "admin":
      case "superadmin":
        return (
          <Button
            icon={ListCheck}
            onClick={() => navigate(PATHS.ADMIN.APPROVE_COMPANY)}
            className="hidden! text-xs! md:flex!"
          >
            Kiểm duyệt
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/60 bg-bg/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <Link to={PATHS.HOME} className="flex items-center">
          <img src={SmartHire_default} alt="SmartHire" className="h-8 w-auto" />
        </Link>
        <SidebarTrigger className="h-9 w-9 rounded-lg hover:bg-slate-100" />
      </div>

      <div className="flex items-center gap-4">
        {renderRoleActionButton()}

        <button
          type="button"
          aria-label="Thông báo"
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3 border-l border-border/40 pl-3">
          <Menu>
            <MenuTrigger
              openOnHover
              className="flex cursor-pointer items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-slate-100/80 focus:outline-none"
            >
              <img
                src={user?.avatarUrl || getLoremAvt(user?.fullName)}
                alt={user?.fullName || "User Avatar"}
                className="aspect-square h-8 w-8 min-w-8 rounded-full object-cover"
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
            </MenuTrigger>

            <MenuPanel align="end" className="min-w-56">
              <div className="flex flex-col px-3 py-2">
                <span className="text-text truncate text-sm font-bold">
                  {displayName}
                </span>
                <span className="truncate text-xs text-text-muted">
                  {displayEmail}
                </span>
              </div>

              <MenuSeparator />

              <MenuGroup>
                <MenuItem
                  onClick={() => navigate(PATHS.HOME)}
                  className="cursor-pointer gap-2"
                >
                  <Home className="size-4" />
                  <span>Trang chủ</span>
                </MenuItem>

                {primaryRole === "candidate" && (
                  <MenuItem
                    onClick={() => navigate(PATHS.CANDIDATE.CV_MANAGEMENT)}
                    className="cursor-pointer gap-2"
                  >
                    <FilePlus className="size-4" />
                    <span>Quản lý CV</span>
                  </MenuItem>
                )}

                <MenuItem
                  onClick={() => navigate(getProfilePathByRole(primaryRole))}
                  className="cursor-pointer gap-2"
                >
                  <UserRound className="size-4" />
                  <span>Thông tin cá nhân</span>
                </MenuItem>
              </MenuGroup>

              <MenuSeparator />

              <MenuItem
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <LogOut className="size-4" />
                <span>{isLoggingOut ? "Đang xuất..." : "Đăng xuất"}</span>
              </MenuItem>
            </MenuPanel>
          </Menu>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
