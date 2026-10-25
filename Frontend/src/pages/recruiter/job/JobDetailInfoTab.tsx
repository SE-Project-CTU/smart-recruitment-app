import dayjs from "dayjs";
import { MapPin } from "lucide-react";
import type { JobPostingItem } from "@/types/job";
import { getEducationLevelLabel, getWorkModeLabel } from "@/utils/jobHelpers";

interface JobDetailInfoTabProps {
  job: JobPostingItem;
  provinceName?: string;
}

export function JobDetailInfoTab({ job, provinceName }: JobDetailInfoTabProps) {
  const displayProvince = provinceName || job.province?.name || "Toàn quốc";

  const fullLocation = [
    job.detailedLocation,
    job.ward?.name,
    job.province?.name || displayProvince,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      {/* Cột chính (Trái - 8 cột): 1 Card chung duy nhất, trải nghiệm đọc liền mạch */}
      <div className="space-y-8 rounded-3xl border border-border bg-surface p-6 shadow-xs sm:p-8 lg:col-span-8">
        {/* 1. Mô tả công việc */}
        <section className="space-y-3">
          <h3 className="border-b border-border/80 pb-2.5 text-sm font-bold text-text-main sm:text-base">
            Mô tả công việc
          </h3>
          <div className="text-xs leading-relaxed whitespace-pre-line text-text-muted sm:text-sm">
            {job.description || "Chưa có thông tin mô tả chi tiết."}
          </div>
        </section>

        {/* 2. Yêu cầu ứng viên */}
        <section className="space-y-3">
          <h3 className="border-b border-border/80 pb-2.5 text-sm font-bold text-text-main sm:text-base">
            Yêu cầu ứng viên
          </h3>
          <div className="text-xs leading-relaxed whitespace-pre-line text-text-muted sm:text-sm">
            {job.requirements || "Chưa có thông tin yêu cầu cụ thể."}
          </div>
        </section>

        {/* 3. Quyền lợi & Chế độ đãi ngộ */}
        {job.benefits && (
          <section className="space-y-3">
            <h3 className="border-b border-border/80 pb-2.5 text-sm font-bold text-text-main sm:text-base">
              Quyền lợi & Chế độ đãi ngộ
            </h3>
            <div className="text-xs leading-relaxed whitespace-pre-line text-text-muted sm:text-sm">
              {job.benefits}
            </div>
          </section>
        )}
      </div>

      {/* Cột phụ (Phải - 4 cột): Card "Thông tin chung" */}
      <div className="space-y-6 lg:sticky lg:top-6 lg:col-span-4">
        {/* Card Thông tin chung */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs">
          <h3 className="border-b border-border/80 pb-3 text-xs font-bold tracking-wider text-text-muted uppercase">
            Thông tin chung
          </h3>

          <div className="mt-4 space-y-3.5 text-xs">
            {/* Kinh nghiệm */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <span className="text-text-muted">Kinh nghiệm</span>
              <span className="font-semibold text-text-main">
                {job.experienceYears > 0
                  ? `${job.experienceYears} năm`
                  : "Không yêu cầu"}
              </span>
            </div>

            {/* Trình độ học vấn */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <span className="text-text-muted">Học vấn</span>
              <span className="font-semibold text-text-main">
                {getEducationLevelLabel(job.educationLevel)}
              </span>
            </div>

            {/* Số lượng tuyển */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <span className="text-text-muted">Số lượng tuyển</span>
              <span className="font-semibold text-text-main">
                {job.vacancies > 0
                  ? `${job.vacancies} người`
                  : "Không giới hạn"}
              </span>
            </div>

            {/* Môi trường làm việc (WorkMode: Onsite, Hybrid, Remote) */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <span className="text-text-muted">Môi trường làm việc</span>
              <span className="font-semibold text-text-main">
                {getWorkModeLabel(job.workMode)}
              </span>
            </div>

            {/* Ngày đăng tin */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <span className="text-text-muted">Ngày đăng tin</span>
              <span className="font-semibold text-text-main">
                {job.createdAt
                  ? dayjs(job.createdAt).format("DD/MM/YYYY")
                  : "—"}
              </span>
            </div>

            {/* Địa chỉ làm việc cụ thể */}
            <div className="pt-1">
              <span className="text-text-muted">Địa chỉ làm việc cụ thể:</span>
              <p className="mt-1.5 flex items-start gap-1.5 text-text-main">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-text-muted" />
                <span className="leading-relaxed">
                  {fullLocation || "Toàn quốc"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
