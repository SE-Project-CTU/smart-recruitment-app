import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import logoSmartHire from "../assets/images/logo/SmartHire_default.svg";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/queries/useAuth";
import { PATHS } from "@/constants/paths";

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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 rounded-full border border-border/60 bg-white/60 py-1.5 pr-4 pl-2 shadow-2xs backdrop-blur-xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-dark text-xs font-bold text-white shadow-xs">
                  {user?.fullName ? (
                    user.fullName.charAt(0).toUpperCase()
                  ) : (
                    <UserIcon size={16} />
                  )}
                </div>
                <span className="text-text max-w-35 truncate text-sm font-semibold">
                  {user?.fullName || user?.email || "Người dùng"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-red-200 bg-red-50/80 px-4 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 hover:text-red-700 active:scale-95 disabled:opacity-50"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut size={15} />
                {isLoggingOut ? "Đang xuất..." : "Đăng xuất"}
              </button>
            </div>
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
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
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
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-dark font-bold text-white">
                  {user?.fullName ? (
                    user.fullName.charAt(0).toUpperCase()
                  ) : (
                    <UserIcon size={18} />
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-text truncate text-sm font-bold">
                    {user?.fullName || "Người dùng"}
                  </span>
                  <span className="truncate text-xs text-text-muted">
                    {user?.email}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-red-500 py-3 text-sm font-semibold text-white shadow-xs transition-all active:scale-98 disabled:opacity-50"
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
