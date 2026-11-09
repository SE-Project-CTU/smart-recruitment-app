import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, LayoutDashboard, FileText, Settings } from "lucide-react";
import logoSmartHire from "@/assets/images/logo/SmartHire_default.svg";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/queries/useAccount";
import { NotificationDropdown } from "@/components/notification/NotificationDropdown";
import { PATHS } from "@/constants/paths";
import { getDashboardPathByRole, getProfilePathByRole } from "@/utils/helper";
import {
  Menu,
  MenuTrigger,
  MenuPanel,
  MenuGroup,
  MenuItem,
  MenuSeparator,
} from "@/components/animate-ui/components/base/menu";
import { UserAvatar } from "./UserAvatar";
import { MorphIcon } from "morphicons/react";
import { X, Menu as MenuIc } from "lucide";

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
              <>
                <NotificationDropdown />
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
                          onClick={() =>
                            navigate(PATHS.CANDIDATE.CV_MANAGEMENT)
                          }
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
                        <Settings className="size-4" />
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
              </>
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
            className="flex size-10 items-center justify-center rounded-lg p-2 text-text-main transition-colors hover:text-primary active:scale-90 lg:hidden"
          >
            {/* <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="size-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <MenuIcon className="size-6" />
                </motion.div>
              )}
            </AnimatePresence> */}
            <MorphIcon icon={isOpen ? X : MenuIc} />
          </button>
        </div>
      </motion.div>

      {/* Mobile Drawer Menu & Backdrop with Motion */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop đóng menu khi click ra ngoài */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="pointer-events-auto fixed inset-0 lg:hidden"
            />

            {/* Panel Mobile Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto absolute top-20 right-4 left-4 origin-top rounded-3xl border border-border/80 bg-bg/95 p-6 shadow-2xl backdrop-blur-xl lg:hidden"
            >
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
                <div className="flex flex-col">
                  {/* Profile Header */}
                  <div className="flex items-center gap-3.5 px-1 py-1">
                    <UserAvatar
                      src={user?.avatarUrl || ""}
                      name={user?.fullName}
                      className="size-11 rounded-full ring-1 ring-border/60"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-base font-bold text-text-main">
                        {user?.fullName || "Người dùng"}
                      </span>
                      <span className="truncate text-xs text-text-muted">
                        {user?.email}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-3 border-t border-border/60" />

                  {/* Menu Items List */}
                  <div className="flex flex-col space-y-1">
                    <Link
                      to={dashboardPath}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3.5 rounded-xl px-2 py-2.5 text-sm font-medium text-text-main/90 transition-colors hover:bg-slate-100/80 hover:text-primary"
                    >
                      <LayoutDashboard className="size-5 shrink-0 text-text-muted transition-colors" />
                      <span>Trang quản lý</span>
                    </Link>

                    {primaryRole === "candidate" && (
                      <Link
                        to={PATHS.CANDIDATE.CV_MANAGEMENT}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3.5 rounded-xl px-2 py-2.5 text-sm font-medium text-text-main/90 transition-colors hover:bg-slate-100/80 hover:text-primary"
                      >
                        <FileText className="size-5 shrink-0 text-text-muted transition-colors" />
                        <span>Quản lý CV</span>
                      </Link>
                    )}

                    <Link
                      to={profilePath}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3.5 rounded-xl px-2 py-2.5 text-sm font-medium text-text-main/90 transition-colors hover:bg-slate-100/80 hover:text-primary"
                    >
                      <Settings className="size-5 shrink-0 text-text-muted transition-colors" />
                      <span>Cài đặt tài khoản</span>
                    </Link>
                  </div>

                  {/* Log out */}
                  <div className="mt-2 border-t border-border/60 pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full cursor-pointer items-center gap-3.5 rounded-xl px-2 py-2.5 text-left text-sm font-medium text-status-error transition-colors hover:bg-red-50/80 disabled:opacity-60"
                    >
                      <LogOut className="size-5 shrink-0 text-status-error" />
                      <span>{isLoggingOut ? "Đang xuất..." : "Đăng xuất"}</span>
                    </button>
                  </div>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export { Header };
export default Header;
