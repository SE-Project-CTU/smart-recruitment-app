import { useState } from "react";
import { Share2, Check, ExternalLink } from "lucide-react";
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

  const hasContactInfo = Boolean(
    company.email || company.phone || company.website || company.address,
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      {/* 1. Thống kê nhanh: Tinh gọn, không lạm dụng card & icon */}
      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="pr-4">
          <p className="text-xs text-text-muted">Việc làm đang mở</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-text-main">
            {activeJobCount}
          </p>
        </div>

        <div className="pl-4">
          <p className="text-xs text-text-muted">Người theo dõi</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-text-main">
            {followerCount}
          </p>
        </div>
      </div>

      {/* 2. Kênh liên hệ trực tiếp */}
      {hasContactInfo && (
        <>
          <hr className="my-6 border-border/70" />

          <section>
            <h3 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Kênh liên hệ
            </h3>

            <dl className="mt-4 space-y-4 text-xs">
              {company.email && (
                <div>
                  <dt className="text-text-muted">Email tuyển dụng</dt>
                  <dd className="mt-0.5">
                    <a
                      href={`mailto:${company.email}`}
                      className="block truncate font-medium text-primary transition-colors hover:underline"
                    >
                      {company.email}
                    </a>
                  </dd>
                </div>
              )}

              {company.phone && (
                <div>
                  <dt className="text-text-muted">Số điện thoại</dt>
                  <dd className="mt-0.5">
                    <a
                      href={`tel:${company.phone}`}
                      className="block font-medium text-text-main transition-colors hover:text-primary"
                    >
                      {company.phone}
                    </a>
                  </dd>
                </div>
              )}

              {company.website && (
                <div>
                  <dt className="text-text-muted">Website chính thức</dt>
                  <dd className="mt-0.5">
                    <a
                      href={
                        company.website.startsWith("http")
                          ? company.website
                          : `https://${company.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-full items-center gap-1 truncate font-medium text-primary transition-colors hover:underline"
                    >
                      <span className="truncate">
                        {company.website.replace(/^https?:\/\//, "")}
                      </span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  </dd>
                </div>
              )}

              {company.address && (
                <div>
                  <dt className="text-text-muted">Trụ sở doanh nghiệp</dt>
                  <dd className="mt-0.5 leading-relaxed font-medium text-text-main">
                    {company.address}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </>
      )}

      {/* 3. Chia sẻ trang công ty */}
      <hr className="my-6 border-border/70" />

      <section>
        <h3 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
          Chia sẻ hồ sơ
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">
          Lan tỏa thông tin công ty và cơ hội nghề nghiệp tới cộng đồng
        </p>

        <Button
          variant="secondary"
          icon={copied ? Check : Share2}
          onClick={handleCopyLink}
          className={`mt-3.5! w-full! py-2! text-xs! font-medium! ${
            copied
              ? "border-emerald-200! bg-emerald-50! text-emerald-700!"
              : ""
          }`}
        >
          {copied ? "Đã sao chép liên kết" : "Sao chép liên kết"}
        </Button>
      </section>
    </div>
  );
}

export default CompanySidebarInfo;
