import {
  Briefcase,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileText,
  Gift,
  Globe,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { JobPostingItem } from "@/types/job";
import type { CompanyItem } from "@/types/company";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import {
  getEducationLevelLabel,
  getJobLevelLabel,
} from "@/utils/jobHelpers";

interface JobDetailInfoTabProps {
  job: JobPostingItem;
  company?: CompanyItem | null;
  provinceName?: string;
}

export function JobDetailInfoTab({
  job,
  company,
  provinceName,
}: JobDetailInfoTabProps) {
  const displayProvince = provinceName || job.province?.name || "Toàn quốc";
  const compName = company?.name || job.company?.name || job.companyName || "Doanh nghiệp";
  const compLogo = company?.logoUrl || job.company?.logoUrl || job.companyLogoUrl || null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Cột chính (Trái - 8 cột): Chi tiết nội dung công việc */}
      <div className="space-y-6 lg:col-span-8">
        {/* 1. Mô tả công việc */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900">
            <FileText className="size-4 text-slate-600" />
            <h3 className="text-base font-bold">Mô tả công việc</h3>
          </div>
          <div className="mt-4 whitespace-pre-line text-xs leading-relaxed text-slate-700 sm:text-sm">
            {job.description || "Chưa có thông tin mô tả chi tiết."}
          </div>
        </div>

        {/* 2. Yêu cầu công việc */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900">
            <CheckCircle2 className="size-4 text-slate-600" />
            <h3 className="text-base font-bold">Yêu cầu ứng viên</h3>
          </div>
          <div className="mt-4 whitespace-pre-line text-xs leading-relaxed text-slate-700 sm:text-sm">
            {job.requirements || "Chưa có thông tin yêu cầu cụ thể."}
          </div>
        </div>

        {/* 3. Quyền lợi & Chế độ đãi ngộ */}
        {job.benefits && (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900">
              <Gift className="size-4 text-slate-600" />
              <h3 className="text-base font-bold">Quyền lợi & Chế độ đãi ngộ</h3>
            </div>
            <div className="mt-4 whitespace-pre-line text-xs leading-relaxed text-slate-700 sm:text-sm">
              {job.benefits}
            </div>
          </div>
        )}
      </div>

      {/* Cột phụ (Phải - 4 cột): Thông tin doanh nghiệp & Thông số tuyển dụng */}
      <div className="space-y-6 lg:col-span-4">
        {/* Card 1: Yêu cầu tuyển dụng chung */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Yêu cầu tuyển dụng
          </h3>

          <div className="mt-4 space-y-3.5 text-xs">
            {/* Cấp bậc */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500">Cấp bậc</span>
              <span className="font-semibold text-slate-800">
                {getJobLevelLabel(job.jobLevel)}
              </span>
            </div>

            {/* Kinh nghiệm */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500">Kinh nghiệm</span>
              <span className="font-semibold text-slate-800">
                {job.experienceYears > 0
                  ? `${job.experienceYears} năm`
                  : "Không yêu cầu"}
              </span>
            </div>

            {/* Trình độ học vấn */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500">Học vấn</span>
              <span className="font-semibold text-slate-800">
                {getEducationLevelLabel(job.educationLevel)}
              </span>
            </div>

            {/* Số lượng tuyển */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500">Số lượng tuyển</span>
              <span className="font-semibold text-slate-800">
                {job.vacancies > 0 ? `${job.vacancies} người` : "Không giới hạn"}
              </span>
            </div>

            {/* Địa điểm làm việc chi tiết */}
            <div className="pt-1">
              <span className="text-slate-500">Địa chỉ làm việc:</span>
              <p className="mt-1 flex items-start gap-1.5 text-slate-700">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
                <span>
                  {job.detailedLocation ? `${job.detailedLocation}, ` : ""}
                  {job.ward?.name ? `${job.ward.name}, ` : ""}
                  {displayProvince}
                </span>
              </p>
            </div>

            {/* Kỹ năng chuyên môn yêu cầu */}
            {job.skills && job.skills.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <span className="text-slate-500">Kỹ năng yêu cầu:</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {job.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Thông tin Doanh nghiệp */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Thông tin doanh nghiệp
          </h3>

          <div className="mt-4 flex items-center gap-3">
            <CompanyLogo logoUrl={compLogo} name={compName} size="md" />
            <div className="min-w-0">
              <h4 className="truncate text-sm font-bold text-slate-900">
                {compName}
              </h4>
              {company?.verificationStatus === "Verified" && (
                <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <ShieldCheck className="size-3" />
                  Đã xác thực
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2.5 text-xs text-slate-600">
            {company?.taxCode && (
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Mã số thuế:</span>
                <span className="font-mono font-medium text-slate-700">{company.taxCode}</span>
              </div>
            )}

            {company?.email && (
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{company.email}</span>
              </div>
            )}

            {company?.website && (
              <div className="flex items-center gap-2">
                <Globe className="size-3.5 shrink-0 text-slate-400" />
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-primary hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}

            {company?.address && (
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
                <span className="leading-relaxed">{company.address}</span>
              </div>
            )}
          </div>

          {job.companyId && (
            <Link
              to={`/recruiter/company-management/${job.companyId}/overview`}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-slate-50 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-primary hover:bg-white hover:text-primary"
            >
              <span>Xem hồ sơ công ty</span>
              <ExternalLink className="size-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
