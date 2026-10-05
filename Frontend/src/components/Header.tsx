import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoSmartHire from "../assets/images/logo/SmartHire_default.svg";
import Button from "./Button";

const headerItems = [
  { title: "Việc làm", href: "/" },
  { title: "Tạo CV", href: "/" },
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
    <header className="fixed top-5 inset-x-0 z-50 mx-auto max-w-7xl px-4 transition-all duration-300">
      <div
        // className={`flex items-center justify-between rounded-full bg-bg px-6 lg:px-12 shadow-lg border border-border/50 backdrop-blur-md transition-all duration-300 ${
        //   isScrolled ? "h-14 bg-bg" : "h-16"
        // }`}
        className="flex items-center justify-between rounded-full bg-bg px-6 lg:px-12 shadow-lg border border-border/50 backdrop-blur-md transition-all duration-300 h-16"
      >
        <Link to="/" className="flex items-center">
          <img
            src={logoSmartHire}
            alt="SmartHire Logo"
            className="w-36 lg:w-40"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {headerItems.map((item, index) => (
            <Link key={index} to={item.href} className="header-link-item">
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button type="secondary" text="Đăng nhập" />
          <Button type="primary" text="Đăng ký ngay" />
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          className="p-2 text-text-main hover:text-primary lg:hidden transition-transform duration-200 active:scale-90"
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 lg:hidden w-full rounded-3xl bg-bg border border-border p-6 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-4">
            {headerItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-text-main hover:text-primary transition-colors py-1"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="my-5 border-t border-border" />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="secondary" text="Đăng nhập" />
            <Button type="primary" text="Đăng ký ngay" />
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
