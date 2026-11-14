import React from "react";
import { Link } from "react-router-dom";
import { SmartHire_default, SmartHire_text_only } from "@/assets/images/logo";
import { PATHS } from "@/constants/paths";

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer
      className={`text-text w-full overflow-hidden border-t border-stone-200/80 bg-white pt-16 pb-6 sm:pt-20 ${className}`}
    >
      <div className="container mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 pb-16 md:grid-cols-2 lg:grid-cols-5 lg:gap-16">
          <div className="space-y-5 lg:col-span-2">
            <div className="flex items-center gap-2">
              <img
                src={SmartHire_default}
                alt="SmartHire Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-text-muted md:text-base">
              Nền tảng công nghệ việc làm và tạo CV thế hệ mới, ứng dụng trí tuệ
              nhân tạo giúp gắn kết nhân tài và tổ chức nhanh chóng, hiệu quả và
              tối ưu chi phí.
            </p>
            <div className="space-y-2 pt-2 text-xs text-text-muted sm:text-sm">
              <p>
                <strong className="text-text font-semibold">Hotline:</strong>{" "}
                1900 3268 (8:00 - 18:00 Thứ 2 - Thứ 6)
              </p>
              <p>
                <strong className="text-text font-semibold">Email:</strong>{" "}
                support@smarthire.vn
              </p>
              <p>
                <strong className="text-text font-semibold">Trụ sở:</strong>{" "}
                Tầng 12, Tòa nhà Sheraton, đường 30/4, Ninh Kiều, Cần Thơ
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-text text-xs font-bold tracking-wider uppercase">
              Dành Cho Ứng Viên
            </h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Tạo CV AI chuẩn ATS
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Tìm việc làm IT & Tech
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Tìm việc làm Marketing
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Thư viện mẫu CV đẹp
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Kiểm tra điểm ATS của CV
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-text text-xs font-bold tracking-wider uppercase">
              Nhà Tuyển Dụng
            </h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Đăng tin tuyển dụng
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Tìm hồ sơ nhân tài AI
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Giải pháp ATS Doanh nghiệp
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Báo cáo thị trường lương
                </a>
              </li>
              <li>
                <Link to={PATHS.CONTACT} className="transition-colors hover:text-primary">
                  Liên hệ tư vấn HR
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-text text-xs font-bold tracking-wider uppercase">
              Về SmartHire
            </h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Giới thiệu nền tảng
                </a>
              </li>
              <li>
                <Link to={PATHS.BLOG} className="transition-colors hover:text-primary">
                  Blog & Cẩm nang nghề nghiệp
                </Link>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Chính sách bảo mật dữ liệu
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <Link to={PATHS.FAQS} className="transition-colors hover:text-primary">
                  Trung tâm trợ giúp (FAQs)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-stone-200/70 pt-8 text-xs text-text-muted sm:flex-row sm:text-sm">
          <p>
            © 2026 SmartHire Inc. Nền tảng tuyển dụng thông minh. Mọi quyền được
            bảo lưu.
          </p>
          <div className="flex flex-wrap justify-center gap-6 font-medium">
            <a href="#" className="transition-colors hover:text-primary">
              Quyền riêng tư
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Điều khoản
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Bảo mật
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Sitemap
            </a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none mt-12 flex w-full justify-center px-4 opacity-95 select-none">
        <img
          src={SmartHire_text_only}
          alt="SmartHire Brand"
          className="h-auto w-full max-w-350 object-contain"
        />
      </div>
    </footer>
  );
};

export default Footer;

