import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import dayjs from "dayjs";
import type { CompanyItem } from "@/types/company";

export interface CompanyOverviewTabProps {
  company: CompanyItem;
}

export function CompanyOverviewTab({ company }: CompanyOverviewTabProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const description = company.description?.trim() || "";
  const shouldTruncate = description.length > 500;
  const displayText =
    shouldTruncate && !isExpanded
      ? `${description.slice(0, 500)}...`
      : description;

  const isVerified = company.verificationStatus === "Verified";
  const memberSince = company.createdAt
    ? dayjs(company.createdAt).format("DD/MM/YYYY")
    : null;
  const lastUpdated = company.updatedAt
    ? dayjs(company.updatedAt).format("DD/MM/YYYY")
    : null;
  const verifiedDate = company.verifiedAt
    ? dayjs(company.verifiedAt).format("DD/MM/YYYY")
    : null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      {/* 1. Phần giới thiệu (Editorial Narrative) */}
      <section>
        <h2 className="text-lg font-medium text-text-main sm:text-xl">
          Giới thiệu doanh nghiệp
        </h2>

        {description ? (
          <div className="mt-4">
            <p className="max-w-3xl text-sm leading-relaxed whitespace-pre-line text-text-main/80 sm:text-base/relaxed">
              {displayText}
            </p>

            {shouldTruncate && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-3.5 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
              >
                <span>
                  {isExpanded ? "Thu gọn giới thiệu" : "Đọc toàn bộ giới thiệu"}
                </span>
                {isExpanded ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </button>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-text-muted italic">
            Doanh nghiệp chưa cập nhật nội dung giới thiệu chi tiết.
          </p>
        )}
      </section>

      {/* 2. Đường phân cách tinh tế */}
      <hr className="my-8 border-border/70" />

      {/* 3. Hồ sơ pháp lý & Xác thực minh bạch (Data Factsheet) */}
      <section>
        <h3 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
          Thông tin pháp lý & Tính xác thực
        </h3>

        <dl className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Mã số thuế */}
          <div className="space-y-1">
            <dt className="text-xs text-text-muted">Mã số thuế</dt>
            <dd className="text-sm font-semibold text-text-main">
              {company.taxCode || "Chưa cập nhật"}
            </dd>
          </div>

          {/* Trạng thái xác minh */}
          <div className="space-y-1">
            <dt className="text-xs text-text-muted">Trạng thái hồ sơ</dt>
            <dd className="flex items-center gap-2 text-sm font-semibold text-text-main">
              <span>
                {isVerified ? "Đã xác thực pháp lý" : "Chờ xác thực hồ sơ"}
              </span>
            </dd>
            {isVerified && verifiedDate && (
              <p className="text-[11px] text-text-muted">
                Xác thực vào {verifiedDate}
              </p>
            )}
          </div>

          {/* Thời gian tham gia */}
          <div className="space-y-1">
            <dt className="text-xs text-text-muted">Tham gia nền tảng</dt>
            <dd className="text-sm font-semibold text-text-main">
              {memberSince || "Chưa xác định"}
            </dd>
          </div>

          {/* Lần cập nhật gần nhất */}
          <div className="space-y-1">
            <dt className="text-xs text-text-muted">Cập nhật gần nhất</dt>
            <dd className="text-sm font-semibold text-text-main">
              {lastUpdated || "Mới đây"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default CompanyOverviewTab;
