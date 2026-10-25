import dayjs from "dayjs";
import { Layers, MapPin, Sparkles } from "lucide-react";
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

        {/* 3. Kỹ năng chuyên môn */}
        {job.skills && job.skills.length > 0 && (
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 border-b border-border/80 pb-2.5 text-sm font-bold text-text-main sm:text-base">
              <Sparkles className="size-4 text-primary" />
              <span>Kỹ năng chuyên môn</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {job.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center rounded-xl border border-border bg-secondary-light px-3 py-1.5 text-xs font-medium text-primary capitalize select-none"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 4. Ngành nghề tuyển dụng */}
        {job.industries && job.industries.length > 0 && (
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 border-b border-border/80 pb-2.5 text-sm font-bold text-text-main sm:text-base">
              <Layers className="size-4 text-primary" />
              <span>Ngành nghề tuyển dụng</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {job.industries.map((ind) => (
                <span
                  key={ind.id}
                  className="inline-flex items-center rounded-xl border border-border/80 bg-bg px-3 py-1.5 text-xs font-medium text-text-main select-none"
                >
                  {ind.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 5. Quyền lợi & Chế độ đãi ngộ */}
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

      {/* Cột phụ (Phải - 4 cột): Card "Thông tin chung" & "Người đăng tin" */}
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

        {/* Card Người đăng tin (Creator) */}
        {job.creator && (
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs">
            <h3 className="border-b border-border/80 pb-3 text-xs font-bold tracking-wider text-text-muted uppercase">
              Người đăng tin
            </h3>
            <div className="mt-4 flex items-center gap-3">
              {job.creator.avatarUrl ? (
                <img
                  src={job.creator.avatarUrl}
                  alt={job.creator.fullName}
                  className="size-10 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {job.creator.fullName
                    ? job.creator.fullName.slice(0, 2).toUpperCase()
                    : "HR"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-text-main">
                  {job.creator.fullName || "Nhà tuyển dụng"}
                </p>
                <p className="truncate text-[11px] text-text-muted">
                  {job.creator.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
