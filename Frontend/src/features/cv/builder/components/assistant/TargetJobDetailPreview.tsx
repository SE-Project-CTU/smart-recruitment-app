import React from "react";
import {
  Briefcase,
  CircleDollarSign,
  Clock,
  Sparkles,
  FileText,
  Gift,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/common";
import { getWorkModeLabel } from "@/utils/jobHelpers";
import type { TargetJobOption } from "./types";

interface TargetJobDetailPreviewProps {
  selectedJob: TargetJobOption | null;
  isLoadingDetail: boolean;
  isErrorDetail: boolean;
  detailErrorMessage: string | null;
  onRetryDetail: () => void;
}

/**
 * Cột bên phải của Modal Chọn Job:
 * - Hiển thị bản mô tả công việc (JD) chi tiết của Job được chọn
 * - Header thông tin công ty, địa điểm, mức lương, kinh nghiệm
 * - Map mã workMode sang text tiếng Việt thân thiện qua getWorkModeLabel
 * - Danh sách kỹ năng yêu cầu, mô tả công việc, yêu cầu ứng viên và quyền lợi
 * - Trạng thái rỗng khi chưa chọn công việc nào
 */
export const TargetJobDetailPreview: React.FC<TargetJobDetailPreviewProps> = ({
  selectedJob,
  isLoadingDetail,
  isErrorDetail,
  detailErrorMessage,
  onRetryDetail,
}) => {
  if (!selectedJob) {
    return (
      <div className="hidden min-w-0 flex-1 flex-col items-center justify-center bg-surface p-8 text-center text-text-muted md:flex">
        <Briefcase className="mb-2 size-10 text-text-muted/50" />
        <p className="text-xs font-semibold text-text-main">
          Chưa chọn công việc nào
        </p>
        <p className="mt-1 max-w-[220px] text-[11px]">
          Nhấn vào một công việc ở danh sách bên trái để xem mô tả và yêu cầu
          chi tiết
        </p>
      </div>
    );
  }

  const workModeText = getWorkModeLabel(selectedJob.workMode);

  return (
    <div className="hidden min-w-0 flex-1 flex-col overflow-hidden bg-surface md:flex">
      <div className="flex h-full flex-col overflow-hidden">
        {/* 1. Header chi tiết Job */}
        <div className="shrink-0 border-b border-border/70 bg-gradient-to-b from-primary/5 to-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-base leading-tight font-bold text-text-main">
                {selectedJob.title}
              </h4>
              <div className="mt-2 flex flex-col items-start gap-1 text-xs text-text-muted">
                <span className="font-semibold text-primary">
                  {selectedJob.companyName}
                </span>
                <span>{selectedJob.location}</span>
              </div>
            </div>

            {isLoadingDetail && (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <Loader2 className="size-3 animate-spin" />
                Đang nạp chi tiết...
              </span>
            )}
          </div>

          {/* Quick info pills: Mức lương, Kinh nghiệm, Hình thức làm việc */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px]">
            {selectedJob.salaryText && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 font-medium text-text-main">
                {selectedJob.salaryText}
              </span>
            )}
            {selectedJob.experienceLevel && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 font-medium text-text-main">
                {selectedJob.experienceLevel}
              </span>
            )}
            {selectedJob.workMode && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 font-medium text-text-main">
                {workModeText}
              </span>
            )}
          </div>
        </div>

        {/* 2. Banner lỗi nạp chi tiết (nếu có) */}
        {isErrorDetail && (
          <div className="mx-5 mt-4 flex shrink-0 items-center justify-between rounded-lg border border-status-error/40 bg-status-error/10 p-2.5 text-xs text-status-error">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{detailErrorMessage}</span>
            </div>
            <Button
              variant="secondary"
              icon={RefreshCw}
              iconSize={11}
              onClick={onRetryDetail}
              className="h-6! rounded-md! px-2! text-[10px]!"
            >
              Thử lại
            </Button>
          </div>
        )}

        {/* 3. Nội dung JD chi tiết (Cuộn độc lập) */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs text-text-main">
          {/* 3.1 Kỹ năng chuyên môn yêu cầu */}
          {selectedJob.skills && selectedJob.skills.length > 0 && (
            <div className="space-y-2">
              <h5 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-text-muted uppercase">
                <Sparkles className="size-3.5 text-primary" />
                Kỹ năng chuyên môn yêu cầu
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3.2 Mô tả công việc */}
          {selectedJob.description && (
            <div className="space-y-1.5">
              <h5 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-text-muted uppercase">
                <FileText className="size-3.5 text-primary" />
                Mô tả công việc
              </h5>
              <p className="leading-relaxed whitespace-pre-line text-text-muted">
                {selectedJob.description}
              </p>
            </div>
          )}

          {/* 3.3 Yêu cầu ứng viên */}
          {selectedJob.requirements && selectedJob.requirements.length > 0 && (
            <div className="space-y-2">
              <h5 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-text-muted uppercase">
                <Briefcase className="size-3.5 text-primary" />
                Yêu cầu ứng viên
              </h5>
              <ul className="space-y-1.5 pl-1 text-text-muted">
                {selectedJob.requirements.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 leading-relaxed"
                  >
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3.4 Chế độ đãi ngộ & Quyền lợi */}
          {selectedJob.benefits && selectedJob.benefits.length > 0 && (
            <div className="space-y-2">
              <h5 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-text-muted uppercase">
                <Gift className="size-3.5" />
                Chế độ đãi ngộ
              </h5>
              <ul className="space-y-1.5 pl-1 text-text-muted">
                {selectedJob.benefits.map((bene, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 leading-relaxed"
                  >
                    <span>{bene}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
