import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Share2,
  Check,
  Building2,
  Users,
  Briefcase,
} from "lucide-react";
import Button from "@/components/common/Button";
import { toast } from "@/hooks/use-toast";
import type { CompanyItem } from "@/types/company";

export interface CompanySidebarInfoProps {
  company: CompanyItem;
  followerCount?: number;
  activeJobCount?: number;
}

export function CompanySidebarInfo({
  company,
  followerCount = 0,
  activeJobCount = 0,
}: CompanySidebarInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({
        title: "Đã sao chép liên kết",
        description: "Đường dẫn trang công ty đã được lưu vào bộ nhớ tạm.",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({
        title: "Không thể sao chép",
        description: "Vui lòng sao chép thủ công liên kết từ thanh địa chỉ.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Thống kê nhanh */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <Briefcase className="size-4 text-primary" />
            <span className="text-xs">Việc làm đang mở</span>
          </div>
          <p className="mt-2 text-xl font-bold text-text-main">
            {activeJobCount}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <Users className="size-4 text-primary" />
            <span className="text-xs">Người theo dõi</span>
          </div>
          <p className="mt-2 text-xl font-bold text-text-main">
            {followerCount}
          </p>
        </div>
      </div>

      {/* 2. Thông tin liên hệ & Pháp lý */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-text-main">
          Thông tin liên hệ
        </h3>

        <div className="mt-4 space-y-3.5 text-xs">
          {/* Email */}
          {company.email && (
            <div className="flex items-start gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-bg text-text-muted">
                <Mail className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-muted">Email liên hệ</p>
                <a
                  href={`mailto:${company.email}`}
                  className="mt-0.5 block truncate font-medium text-primary hover:underline"
                >
                  {company.email}
                </a>
              </div>
            </div>
          )}

          {/* Hotline / Số điện thoại */}
          {company.phone && (
            <div className="flex items-start gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-bg text-text-muted">
                <Phone className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-muted">Số điện thoại</p>
                <a
                  href={`tel:${company.phone}`}
                  className="mt-0.5 block font-medium text-text-main hover:text-primary"
                >
                  {company.phone}
                </a>
              </div>
            </div>
          )}

          {/* Địa chỉ trụ sở */}
          {company.address && (
            <div className="flex items-start gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-bg text-text-muted">
                <MapPin className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-muted">Trụ sở doanh nghiệp</p>
                <p className="mt-0.5 font-medium leading-relaxed text-text-main">
                  {company.address}
                </p>
              </div>
            </div>
          )}

          {/* Website */}
          {company.website && (
            <div className="flex items-start gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-bg text-text-muted">
                <Globe className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-muted">Website chính thức</p>
                <a
                  href={
                    company.website.startsWith("http")
                      ? company.website
                      : `https://${company.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 block truncate font-medium text-primary hover:underline"
                >
                  {company.website}
                </a>
              </div>
            </div>
          )}

          {/* Mã số thuế */}
          {company.taxCode && (
            <div className="flex items-start gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-bg text-text-muted">
                <Building2 className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-text-muted">Mã số thuế</p>
                <p className="mt-0.5 font-medium text-text-main">
                  {company.taxCode}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Chia sẻ doanh nghiệp */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-text-main">
          Chia sẻ trang công ty
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          Chia sẻ cơ hội tuyển dụng và hồ sơ công ty tới bạn bè và cộng đồng
        </p>

        <Button
          variant="secondary"
          icon={copied ? Check : Share2}
          onClick={handleCopyLink}
          className={`mt-3.5! w-full! text-xs! px-3.5! py-2! ${
            copied ? "text-emerald-700! border-emerald-200! bg-emerald-50!" : ""
          }`}
        >
          {copied ? "Đã sao chép liên kết" : "Sao chép liên kết"}
        </Button>
      </div>
    </div>
  );
}

export default CompanySidebarInfo;
