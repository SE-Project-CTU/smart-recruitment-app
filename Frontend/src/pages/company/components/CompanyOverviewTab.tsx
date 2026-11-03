import { useState } from "react";
import {
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import dayjs from "dayjs";
import type { CompanyItem } from "@/types/company";

export interface CompanyOverviewTabProps {
  company: CompanyItem;
}

export function CompanyOverviewTab({ company }: CompanyOverviewTabProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const description = company.description?.trim() || "";
  const shouldTruncate = description.length > 450;
  const displayText =
    shouldTruncate && !isExpanded
      ? `${description.slice(0, 450)}...`
      : description;

  return (
    <div className="space-y-6">
      {/* 1. Giới thiệu doanh nghiệp */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
        <h2 className="text-base font-semibold text-text-main">
          Về {company.name}
        </h2>

        {description ? (
          <div className="mt-4">
            <p className="text-sm leading-relaxed whitespace-pre-line text-text-muted">
              {displayText}
            </p>

            {shouldTruncate && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-3.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>{isExpanded ? "Thu gọn nội dung" : "Xem thêm mô tả"}</span>
                {isExpanded ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </button>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm italic text-text-muted">
            Doanh nghiệp chưa cập nhật phần giới thiệu tổng quan.
          </p>
        )}
      </div>

      {/* 2. Điểm nổi bật & Thông tin hoạt động */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Địa điểm trụ sở chính */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="size-4.5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Địa chỉ trụ sở</p>
              <p className="mt-0.5 text-sm font-medium text-text-main">
                {company.address || "Chưa cập nhật"}
              </p>
            </div>
          </div>
        </div>

        {/* Mã số thuế */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-4.5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Mã số thuế</p>
              <p className="mt-0.5 text-sm font-medium text-text-main">
                {company.taxCode || "Chưa cập nhật"}
              </p>
            </div>
          </div>
        </div>

        {/* Thời gian tham gia SmartHire */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calendar className="size-4.5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Tham gia nền tảng</p>
              <p className="mt-0.5 text-sm font-medium text-text-main">
                {company.createdAt
                  ? dayjs(company.createdAt).format("DD/MM/YYYY")
                  : "Chưa rõ"}
              </p>
            </div>
          </div>
        </div>

        {/* Tình trạng pháp lý */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-4.5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Trạng thái hồ sơ</p>
              <p className="mt-0.5 text-sm font-medium text-text-main">
                {company.verificationStatus === "Verified"
                  ? "Hồ sơ doanh nghiệp hợp lệ"
                  : "Đang chờ hoàn thiện xác minh"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyOverviewTab;
