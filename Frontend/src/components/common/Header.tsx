import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu as MenuIcon,
  X,
  LogOut,
  LayoutDashboard,
  FileText,
  UserRound,
} from "lucide-react";
import logoSmartHire from "@/assets/images/logo/SmartHire_default.svg";
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
import { UserAvatar } from "./UserAvatar";

interface HeaderNavItem {
  title: string;
  href: string;
}

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated } = useAuthStore();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  const isHomePage =
    location.pathname === PATHS.HOME || location.pathname === "/";

  const isFloating = isScrolled;

  const userRoles = useMemo(
    () => user?.roles?.map((r) => r.toLowerCase()) || [],
    [user?.roles],
  );
  const isAdmin = userRoles.includes("admin");
  const isRecruiter = userRoles.includes("recruiter");

  const primaryRole = user?.roles?.[0]?.toLowerCase() || "candidate";
  const dashboardPath = getDashboardPathByRole(primaryRole);
  const profilePath = getProfilePathByRole(primaryRole);

  const navItems = useMemo<HeaderNavItem[]>(() => {
    let secondItem: HeaderNavItem = { title: "Tạo CV", href: PATHS.CREATE_CV };

    if (isAdmin) {
      secondItem = {
        title: "Kiểm duyệt",
        href: PATHS.ADMIN.APPROVE_COMPANY,
      };
    } else if (isRecruiter) {
      secondItem = {
        title: "Công ty của tôi",
        href: PATHS.RECRUITER.COMPANY_MANAGEMENT,
      };
    }

    return [
      { title: "Việc làm", href: PATHS.SEARCH_JOB },
      secondItem,
      { title: "Blog nghề nghiệp", href: PATHS.BLOG },
      { title: "Liên hệ", href: PATHS.HOME },
      { title: "FAQs", href: PATHS.HOME },
    ];
  }, [isAdmin, isRecruiter]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center">
      <motion.div
        layout
        transition={{ type: "spring", ease: "easeInOut", duration: 0.3 }}
        className={`pointer-events-auto flex h-16 border bg-linear-to-r from-transparent via-bg/80 to-transparent backdrop-blur-md transition-all duration-300 ${
          isFloating
            ? "mt-4 w-[calc(100%-2rem)] max-w-7xl rounded-full border-border/50 shadow-lg"
            : "mt-0 w-full rounded-none border-x-0 border-t-0 border-b border-border/40 shadow-none"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link to={PATHS.HOME} className="flex items-center">
            <img
              src={logoSmartHire}
              alt="SmartHire Logo"
              className="w-24 lg:w-40"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item, index) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== PATHS.HOME &&
                  location.pathname.startsWith(item.href));
              return (
                <Link
                  key={index}
                  to={item.href}
                  className={`header-link-item relative transition-colors ${
                    isActive
                      ? "font-semibold text-primary"
                      : "text-text-main hover:text-primary"
                  }`}
                >
                  {item.title}
                  {isActive && !isHomePage && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Action Buttons */}
          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <Menu>
                <MenuTrigger
                  openOnHover
                  className="flex cursor-pointer items-center gap-2.5 rounded-full p-1 shadow-2xs backdrop-blur-xs transition-transform focus:outline-none active:scale-95"
                >
                  <UserAvatar
                    src={user?.avatarUrl || ""}
                    name={user?.fullName}
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

          {/* Mobile Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            className="p-2 text-text-main transition-transform duration-200 hover:text-primary active:scale-90 lg:hidden"
          >
            {isOpen ? (
              <X className="size-6" />
            ) : (
              <MenuIcon className="size-6" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-4 pointer-events-auto absolute top-20 right-4 left-4 z-50 rounded-3xl border border-border bg-bg/95 p-6 shadow-2xl backdrop-blur-xl duration-200 lg:hidden">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item, index) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== PATHS.HOME &&
                  location.pathname.startsWith(item.href));
              return (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`py-1 text-base transition-colors ${
                    isActive
                      ? "font-semibold text-primary"
                      : "font-medium text-text-main hover:text-primary"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
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

export { Header };
export default Header;
