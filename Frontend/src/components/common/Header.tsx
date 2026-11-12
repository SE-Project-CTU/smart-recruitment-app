import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Settings,
  LayoutTemplate,
  ChevronDown,
  FileChartLine,
  Bookmark,
  Building2,
  type LucideIcon,
} from "lucide-react";
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
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
} from "@/components/animate-ui/components/base/menu";
import { UserAvatar } from "./UserAvatar";
import { MorphIcon } from "morphicons/react";
import { X, Menu as MenuIc } from "lucide";

interface HeaderNavChild {
  title: string;
  href: string;
  icon?: LucideIcon;
}

interface HeaderNavItem {
  title: string;
  href: string;
  children?: HeaderNavChild[];
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
  const isCandidate = isAuthenticated && !isAdmin && !isRecruiter;

  const primaryRole = user?.roles?.[0]?.toLowerCase() || "candidate";
  const dashboardPath = getDashboardPathByRole(primaryRole);
  const profilePath = getProfilePathByRole(primaryRole);

  const navItems = useMemo<HeaderNavItem[]>(() => {
    if (isCandidate) {
      return [
        { title: "Tổng quan", href: PATHS.CANDIDATE.DASHBOARD },
        { title: "Việc làm", href: PATHS.SEARCH_JOB },
        { title: "Việc làm phù hợp", href: PATHS.CANDIDATE.MATCHED_JOBS },
        {
          title: "Tạo CV",
          href: PATHS.CANDIDATE.CV_MANAGEMENT,
          children: [
            {
              title: "Quản lý CV",
              href: PATHS.CANDIDATE.CV_MANAGEMENT,
              icon: FileText,
            },
            {
              title: "Mẫu CV",
              href: PATHS.CANDIDATE.CV_TEMPLATES,
              icon: LayoutTemplate,
            },
          ],
        },
        { title: "Blog nghề nghiệp", href: PATHS.BLOG },
      ];
    }

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
  }, [isCandidate, isAdmin, isRecruiter]);

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

  const isNavItemActive = (item: HeaderNavItem) => {
    if (item.children?.length) {
      return item.children.some(
        (child) =>
          location.pathname === child.href ||
          location.pathname.startsWith(child.href),
      );
    }

    return (
      location.pathname === item.href ||
      (item.href !== PATHS.HOME && location.pathname.startsWith(item.href))
    );
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center">
      <motion.div
        layout
        transition={{ type: "spring", ease: "easeInOut", duration: 0.3 }}
        className={`pointer-events-auto flex h-16 border bg-linear-to-r from-transparent via-bg/80 to-transparent backdrop-blur-md transition-all duration-300 ${
          isFloating
            ? "mt-2 w-[calc(100%-2rem)] max-w-7xl rounded-full border-border/50 shadow-lg"
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
          <nav className="hidden items-center gap-7 lg:flex xl:gap-8">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item);

              if (item.children?.length) {
                return (
                  <Menu key={item.title}>
                    <MenuTrigger
                      openOnHover
                      className={`header-link-item relative inline-flex cursor-pointer items-center gap-1 transition-colors focus:outline-none ${
                        isActive
                          ? "font-semibold text-primary"
                          : "text-text-main hover:text-primary"
                      }`}
                    >
                      <span>{item.title}</span>
                      <ChevronDown className="size-3.5 opacity-75" />
                      {isActive && !isHomePage && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-primary"
                        />
                      )}
                    </MenuTrigger>

                    <MenuPanel align="start" className="min-w-48">
                      <MenuGroup>
                        {item.children.map((child) => {
                          const Icon = child.icon;
                          return (
                            <MenuItem
                              key={child.href}
                              onClick={() => navigate(child.href)}
                              className="cursor-pointer gap-2.5"
                            >
                              {Icon && (
                                <Icon className="size-4 text-text-muted" />
                              )}
                              <span>{child.title}</span>
                            </MenuItem>
                          );
                        })}
                      </MenuGroup>
                    </MenuPanel>
                  </Menu>
                );
              }

              return (
                <Link
                  key={item.title}
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

                  <MenuPanel align="end" className="min-w-56">
                    <div className="flex flex-col px-3 py-2">
                      <span className="text-text truncate text-sm font-bold">
                        {user?.fullName || "Người dùng"}
                      </span>
                      <span className="truncate text-xs text-text-muted">
                        {user?.email}
                      </span>
                    </div>

                    <MenuSeparator />

                    {isCandidate ? (
                      <>
                        <MenuGroup>
                          <MenuItem
                            onClick={() =>
                              navigate(PATHS.CANDIDATE.APPLICATION_STATUS)
                            }
                            className="cursor-pointer gap-2"
                          >
                            <FileChartLine className="size-4" />
                            <span>Trạng thái hồ sơ</span>
                          </MenuItem>

                          <MenuItem
                            onClick={() => navigate(profilePath)}
                            className="cursor-pointer gap-2"
                          >
                            <Settings className="size-4" />
                            <span>Cài đặt tài khoản</span>
                          </MenuItem>
                        </MenuGroup>

                        <MenuSeparator />

                        <MenuGroup>
                          <MenuGroupLabel>Mục đã lưu</MenuGroupLabel>
                          <MenuItem
                            onClick={() =>
                              navigate(PATHS.CANDIDATE.BOOKMARK_JOBS)
                            }
                            className="cursor-pointer gap-2"
                          >
                            <Bookmark className="size-4" />
                            <span>Việc làm đã lưu</span>
                          </MenuItem>
                          <MenuItem
                            onClick={() =>
                              navigate(PATHS.CANDIDATE.BOOKMARK_COMPANIES)
                            }
                            className="cursor-pointer gap-2"
                          >
                            <Building2 className="size-4" />
                            <span>Công ty đã lưu</span>
                          </MenuItem>
                        </MenuGroup>
                      </>
                    ) : (
                      <MenuGroup>
                        <MenuItem
                          onClick={() => navigate(dashboardPath)}
                          className="cursor-pointer gap-2"
                        >
                          <LayoutDashboard className="size-4" />
                          <span>Trang quản lý</span>
                        </MenuItem>

                        <MenuItem
                          onClick={() => navigate(profilePath)}
                          className="cursor-pointer gap-2"
                        >
                          <Settings className="size-4" />
                          <span>Cài đặt tài khoản</span>
                        </MenuItem>
                      </MenuGroup>
                    )}

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
              className="pointer-events-auto absolute top-20 right-4 left-4 max-h-[calc(100svh-6rem)] origin-top overflow-y-auto rounded-3xl border border-border/80 bg-bg/95 p-6 shadow-2xl backdrop-blur-xl lg:hidden"
            >
              <nav className="flex flex-col space-y-3.5">
                {navItems.map((item) => {
                  const isActive = isNavItemActive(item);

                  if (item.children?.length) {
                    return (
                      <div
                        key={item.title}
                        className="flex flex-col space-y-1.5"
                      >
                        <span
                          className={`py-1 text-base ${
                            isActive
                              ? "font-semibold text-primary"
                              : "font-medium text-text-main"
                          }`}
                        >
                          {item.title}
                        </span>
                        <div className="ml-2 flex flex-col space-y-1 border-l border-border pl-3">
                          {item.children.map((child) => {
                            const Icon = child.icon;
                            const isChildActive =
                              location.pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                to={child.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-2.5 rounded-lg py-1.5 text-sm transition-colors ${
                                  isChildActive
                                    ? "font-semibold text-primary"
                                    : "font-medium text-text-muted hover:text-primary"
                                }`}
                              >
                                {Icon && <Icon className="size-4 shrink-0" />}
                                <span>{child.title}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.title}
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
                    {isCandidate ? (
                      <>
                        <Link
                          to={PATHS.CANDIDATE.APPLICATION_STATUS}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3.5 rounded-xl px-2 py-2.5 text-sm font-medium text-text-main/90 transition-colors hover:bg-slate-100/80 hover:text-primary"
                        >
                          <FileChartLine className="size-5 shrink-0 text-text-muted transition-colors" />
                          <span>Trạng thái hồ sơ</span>
                        </Link>

                        <Link
                          to={profilePath}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3.5 rounded-xl px-2 py-2.5 text-sm font-medium text-text-main/90 transition-colors hover:bg-slate-100/80 hover:text-primary"
                        >
                          <Settings className="size-5 shrink-0 text-text-muted transition-colors" />
                          <span>Cài đặt tài khoản</span>
                        </Link>

                        <div className="pt-2 pb-1 pl-2 text-xs font-semibold text-text-muted">
                          Mục đã lưu
                        </div>
                        <Link
                          to={PATHS.CANDIDATE.BOOKMARK_JOBS}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3.5 rounded-xl px-2 py-2.5 text-sm font-medium text-text-main/90 transition-colors hover:bg-slate-100/80 hover:text-primary"
                        >
                          <Bookmark className="size-5 shrink-0 text-text-muted transition-colors" />
                          <span>Việc làm đã lưu</span>
                        </Link>
                        <Link
                          to={PATHS.CANDIDATE.BOOKMARK_COMPANIES}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3.5 rounded-xl px-2 py-2.5 text-sm font-medium text-text-main/90 transition-colors hover:bg-slate-100/80 hover:text-primary"
                        >
                          <Building2 className="size-5 shrink-0 text-text-muted transition-colors" />
                          <span>Công ty đã lưu</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to={dashboardPath}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3.5 rounded-xl px-2 py-2.5 text-sm font-medium text-text-main/90 transition-colors hover:bg-slate-100/80 hover:text-primary"
                        >
                          <LayoutDashboard className="size-5 shrink-0 text-text-muted transition-colors" />
                          <span>Trang quản lý</span>
                        </Link>

                        <Link
                          to={profilePath}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3.5 rounded-xl px-2 py-2.5 text-sm font-medium text-text-main/90 transition-colors hover:bg-slate-100/80 hover:text-primary"
                        >
                          <Settings className="size-5 shrink-0 text-text-muted transition-colors" />
                          <span>Cài đặt tài khoản</span>
                        </Link>
                      </>
                    )}
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
