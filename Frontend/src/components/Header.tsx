import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu as MenuIcon,
  X,
  LogOut,
  LayoutDashboard,
  FileText,
  UserRound,
} from "lucide-react";
import logoSmartHire from "../assets/images/logo/SmartHire_default.svg";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/queries/useAccount";
import { PATHS } from "@/constants/paths";
import {
  getLoremAvt,
  getDashboardPathByRole,
  getProfilePathByRole,
} from "@/utils/helper";
import {
  Menu,
  MenuTrigger,
  MenuPanel,
  MenuGroup,
  MenuItem,
  MenuSeparator,
} from "@/components/animate-ui/components/base/menu";

const headerItems = [
  { title: "Việc làm", href: PATHS.HOME },
  { title: "Tạo CV", href: PATHS.CREATE_CV },
  { title: "Blog nghề nghiệp", href: PATHS.HOME },
  { title: "Liên hệ", href: PATHS.HOME },
  { title: "FAQs", href: PATHS.HOME },
];

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuthStore();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  const primaryRole = user?.roles?.[0]?.toLowerCase() || "candidate";
  const dashboardPath = getDashboardPathByRole(primaryRole);
  const profilePath = getProfilePathByRole(primaryRole);

  const handleLogout = async () => {
    try {
      await logout(false);
      setIsOpen(false);
      navigate(PATHS.SIGN_IN);
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    }
  };

  return (
    <header className="fixed inset-x-0 top-5 z-50 mx-auto max-w-7xl px-4 transition-all duration-300">
      <div className="flex h-16 items-center justify-between rounded-full border border-border/50 bg-bg/50 px-6 shadow-lg backdrop-blur-md transition-all duration-300 lg:px-12">
        <Link to={PATHS.HOME} className="flex items-center">
          <img
            src={logoSmartHire}
            alt="SmartHire Logo"
            className="w-36 lg:w-40"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {headerItems.map((item, index) => (
            <Link key={index} to={item.href} className="header-link-item">
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <Menu>
              <MenuTrigger
                openOnHover
                className="flex cursor-pointer items-center gap-2.5 rounded-full p-1 shadow-2xs backdrop-blur-xs transition-transform focus:outline-none active:scale-95"
              >
                <img
                  src={user?.avatarUrl || getLoremAvt(user?.fullName)}
                  alt={user?.fullName || "User Avatar"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </MenuTrigger>

              <MenuPanel align="end" className="min-w-52">
                <div className="flex flex-col px-3 py-2">
                  <span className="text-text truncate text-sm font-bold">
                    {user?.fullName || "Người dùng"}
                  </span>
                  <span className="truncate text-xs text-text-muted">
                    {user?.email}
                  </span>
                </div>

                <MenuSeparator />

                <MenuGroup>
                  <MenuItem
                    onClick={() => navigate(dashboardPath)}
                    className="cursor-pointer gap-2"
                  >
                    <LayoutDashboard className="size-4" />
                    <span>Trang quản lý</span>
                  </MenuItem>

                  {primaryRole === "candidate" && (
                    <MenuItem
                      onClick={() => navigate(PATHS.CANDIDATE.CV_MANAGEMENT)}
                      className="cursor-pointer gap-2"
                    >
                      <FileText className="size-4" />
                      <span>Quản lý CV</span>
                    </MenuItem>
                  )}

                  <MenuItem
                    onClick={() => navigate(profilePath)}
                    className="cursor-pointer gap-2"
                  >
                    <UserRound className="size-4" />
                    <span>Cài đặt tài khoản</span>
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
          ) : (
            <>
              <Link to={PATHS.SIGN_IN} className="btn btn-secondary">
                Đăng nhập
              </Link>
              <Link to={PATHS.SIGN_UP} className="btn btn-primary">
                Đăng ký ngay
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          className="p-2 text-text-main transition-transform duration-200 hover:text-primary active:scale-90 lg:hidden"
        >
          {isOpen ? <X className="size-6" /> : <MenuIcon className="size-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-4 mt-3 w-full rounded-3xl border border-border bg-bg/50 p-6 shadow-2xl backdrop-blur-xl duration-200 lg:hidden">
          <nav className="flex flex-col space-y-4">
            {headerItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="py-1 text-base font-medium text-text-main transition-colors hover:text-primary"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="my-5 border-t border-border" />

          {isAuthenticated ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-3 shadow-2xs">
                <img
                  src={user?.avatarUrl || getLoremAvt(user?.fullName)}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex min-w-0 flex-col">
                  <span className="text-text truncate text-sm font-bold">
                    {user?.fullName || "Người dùng"}
                  </span>
                  <span className="truncate text-xs text-text-muted">
                    {user?.email}
                  </span>
                </div>
              </div>

              <Link
                to={dashboardPath}
                onClick={() => setIsOpen(false)}
                className="btn btn-primary flex w-full items-center justify-center gap-2"
              >
                <LayoutDashboard size={16} />
                Trang quản lý
              </Link>

              <Link
                to={profilePath}
                onClick={() => setIsOpen(false)}
                className="btn btn-secondary flex w-full items-center justify-center gap-2"
              >
                <UserRound size={16} />
                Cài đặt tài khoản
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="btn btn-secondary flex w-full items-center justify-center gap-2 text-status-error! ring-status-error!"
              >
                <LogOut size={16} />
                {isLoggingOut ? "Đang xuất..." : "Đăng xuất"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={PATHS.SIGN_IN}
                onClick={() => setIsOpen(false)}
                className="btn btn-secondary w-full text-center"
              >
                Đăng nhập
              </Link>
              <Link
                to={PATHS.SIGN_UP}
                onClick={() => setIsOpen(false)}
                className="btn btn-primary w-full text-center"
              >
                Đăng ký ngay
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
