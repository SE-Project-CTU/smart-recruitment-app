import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoSmartHire from "../assets/images/logo/SmartHire_default.svg";

const headerItems = [
  { title: "Việc làm", href: "/" },
  { title: "Tạo CV", href: "/sign-in" },
  { title: "Blog nghề nghiệp", href: "/" },
  { title: "Liên hệ", href: "/" },
  { title: "FAQs", href: "/" },
];

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  // const [isScrolled, setIsScrolled] = useState(false);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     setIsScrolled(window.scrollY > 40);
  //   };
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  return (
    <header className="fixed inset-x-0 top-5 z-50 mx-auto max-w-7xl px-4 transition-all duration-300">
      <div
        // className={`flex items-center justify-between rounded-full bg-bg px-6 lg:px-12 shadow-lg border border-border/50 backdrop-blur-md transition-all duration-300 ${
        //   isScrolled ? "h-14 bg-bg" : "h-16"
        // }`}
        className="flex h-16 items-center justify-between rounded-full border border-border/50 bg-bg/50 px-6 shadow-lg backdrop-blur-md transition-all duration-300 lg:px-12"
      >
        <Link to="/" className="flex items-center">
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
          <Link to="/sign-in" className="btn btn-secondary">
            Đăng nhập
          </Link>
          <Link to="/sign-up" className="btn btn-primary">
            Đăng ký ngay
          </Link>
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

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/sign-in"
              onClick={() => setIsOpen(false)}
              className="btn btn-secondary"
            >
              Đăng nhập
            </Link>
            <Link
              to="/sign-up"
              onClick={() => setIsOpen(false)}
              className="btn btn-primary"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
