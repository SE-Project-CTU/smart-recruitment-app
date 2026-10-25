import { useState, useMemo, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building2,
  DollarSign,
  GraduationCap,
  Save,
  ShieldCheck,
  Users,
} from "lucide-react";
import Button from "@/components/Button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import BadgeSelector from "@/components/common/BadgeSelector";
import IndustrySelect from "@/components/catalog/IndustrySelect";
import LocationSelector from "@/components/catalog/LocationSelector";
import SkillSelect from "@/components/catalog/SkillSelect";
import { toast } from "@/components/ui/toast";
import { getApiErrorMessage, getApiFieldErrors } from "@/api/errorHandler";
import { PATHS } from "@/constants/paths";
import { useMyCompanies } from "@/hooks/queries/useCompany";
import {
  useJobPostingDetail,
  useUpdateJobPosting,
} from "@/hooks/queries/useJob";
import {
  EDUCATION_LEVEL_OPTIONS,
  JOB_LEVEL_OPTIONS,
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
  normalizeEducationLevel,
  normalizeJobLevel,
  resolveJobType,
  resolveWorkMode,
} from "@/utils/jobHelpers";
import type {
  EducationLevel,
  JobLevel,
  JobPostingItem,
  JobType,
  UpdateJobPostingPayload,
  WorkMode,
} from "@/types";
import type { CompanyItem } from "@/types/company";

interface EditJobFormState {
  title: string;
  provinceId: string;
  wardId: string;
  detailedLocation: string;
  experienceYears: number;
  jobLevel: JobLevel;
  educationLevel: EducationLevel;
  vacancies: number;
  workMode: WorkMode;
  jobType: JobType;
  description: string;
  requirements: string;
  benefits: string;
  salaryMin: string;
  salaryMax: string;
  salaryNegotiable: boolean;
  deadline: string;
  industryIds: string[];
  skillIds: string[];
}

const initialEditState = (job: JobPostingItem): EditJobFormState => ({
  title: job.title || "",
  provinceId: job.provinceId || job.province?.id || "",
  wardId: job.wardId || job.ward?.id || "",
  detailedLocation: job.detailedLocation || "",
  experienceYears: job.experienceYears ?? 0,
  jobLevel: normalizeJobLevel(job.jobLevel),
  educationLevel: normalizeEducationLevel(job.educationLevel),
  vacancies: job.vacancies || 1,
  workMode: resolveWorkMode(job),
  jobType: resolveJobType(job),
  description: job.description || "",
  requirements: job.requirements || "",
  benefits: job.benefits || "",
  salaryMin: job.salaryMin != null ? String(job.salaryMin) : "",
  salaryMax: job.salaryMax != null ? String(job.salaryMax) : "",
  salaryNegotiable: Boolean(job.salaryNegotiable),
  deadline: job.deadline ? dayjs(job.deadline).format("YYYY-MM-DD") : "",
  industryIds: job.industryIds || job.industries?.map((i) => i.id) || [],
  skillIds: job.skillIds || job.skills?.map((s) => s.id) || [],
});

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] leading-tight text-status-error">
      <AlertCircle className="size-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

const inputClassName =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text-main outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20";

/**
 * Component Form chỉnh sửa chi tiết JD:
 * Khởi tạo state bằng keying từ cha (key={job.id}), hoàn toàn không dùng setState trong useEffect.
 */
function EditJobForm({
  job,
  company,
}: {
  job: JobPostingItem;
  company?: CompanyItem;
}) {
  const navigate = useNavigate();
  const updateJobPostingMutation = useUpdateJobPosting(job.id);

  const [formData, setFormData] = useState<EditJobFormState>(() =>
    initialEditState(job),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateForm = <K extends keyof EditJobFormState>(
    key: K,
    value: EditJobFormState[K],
  ) => {
    setFormData((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleTextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    if (name === "experienceYears" || name === "vacancies") {
      updateForm(name, Number(value) as EditJobFormState[typeof name]);
      return;
    }
    if (name in formData) {
      updateForm(name as keyof EditJobFormState, value as never);
    }
  };

  const handleProvinceChange = (provinceId: string) => {
    setFormData((current) => ({ ...current, provinceId, wardId: "" }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.provinceId;
      delete next.wardId;
      return next;
    });
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim())
      errors.title = "Vui lòng nhập tiêu đề công việc.";
    if (!formData.provinceId)
      errors.provinceId = "Vui lòng chọn tỉnh/thành phố.";
    if (formData.vacancies < 1)
      errors.vacancies = "Số lượng tuyển phải lớn hơn 0.";
    if (formData.experienceYears < 0)
      errors.experienceYears = "Kinh nghiệm không thể âm.";
    if (formData.description.trim().length < 20)
      errors.description = "Mô tả cần có ít nhất 20 ký tự.";
    if (formData.requirements.trim().length < 20)
      errors.requirements = "Yêu cầu cần có ít nhất 20 ký tự.";
    if (!formData.salaryNegotiable) {
      const min = Number(formData.salaryMin);
      const max = Number(formData.salaryMax);
      if (formData.salaryMin && min < 0)
        errors.salaryMin = "Mức lương không thể âm.";
      if (formData.salaryMax && max < 0)
        errors.salaryMax = "Mức lương không thể âm.";
      if (formData.salaryMin && formData.salaryMax && min > max) {
        errors.salaryMax =
          "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu.";
      }
    }
    if (
      !formData.deadline ||
      dayjs(formData.deadline).isBefore(dayjs(), "day")
    ) {
      errors.deadline = "Hạn nhận hồ sơ phải từ hôm nay trở đi.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const payload: UpdateJobPostingPayload = {
      title: formData.title.trim(),
      provinceId: formData.provinceId,
      wardId: formData.wardId || null,
      detailedLocation: formData.detailedLocation.trim() || null,
      experienceYears: formData.experienceYears,
      jobLevel: formData.jobLevel,
      educationLevel: formData.educationLevel,
      vacancies: formData.vacancies,
      workMode: formData.workMode,
      jobType: formData.jobType,
      description: formData.description.trim(),
      requirements: formData.requirements.trim(),
      benefits: formData.benefits.trim() || null,
      salaryMin:
        !formData.salaryNegotiable && formData.salaryMin
          ? Number(formData.salaryMin)
          : null,
      salaryMax:
        !formData.salaryNegotiable && formData.salaryMax
          ? Number(formData.salaryMax)
          : null,
      salaryNegotiable: formData.salaryNegotiable,
      deadline: dayjs(formData.deadline).endOf("day").toISOString(),
      industryIds: formData.industryIds,
      skillIds: formData.skillIds,
    };

    try {
      const result = await updateJobPostingMutation.mutateAsync({
        jobId: job.id,
        payload,
      });
      toast.add({
        type: "success",
        description: `Cập nhật tin tuyển dụng “${result.title}” thành công.`,
      });
      navigate(PATHS.RECRUITER.JOB_DETAIL.replace(":id", job.id));
    } catch (error: unknown) {
      const fieldErrs = getApiFieldErrors(error);
      if (fieldErrs) {
        setFieldErrors(fieldErrs);
      }
      toast.add({
        type: "error",
        description: getApiErrorMessage(
          error,
          "Không thể cập nhật tin tuyển dụng. Vui lòng kiểm tra lại thông tin.",
        ),
      });
    }
  };

  const isClosed =
    job.status?.toUpperCase() === "CLOSED" ||
    job.status?.toUpperCase() === "EXPIRED";

  return (
    <form onSubmit={handleSubmit}>
      {/* Banner cảnh báo nếu tin đã đóng/hết hạn */}
      {isClosed && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <AlertTriangle className="size-4 shrink-0 text-amber-600" />
          <span>
            Tin tuyển dụng này hiện đang ở trạng thái <strong>{job.status}</strong>.
            Các thay đổi sẽ được lưu nhưng tin vẫn ở trạng thái đóng cho đến khi được mở lại.
          </span>
        </div>
      )}

      {/* LAYOUT 2 CỘT */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* =========================================================================
            CỘT TRÁI (lg:col-span-7 xl:col-span-8): Chi tiết công việc
            Tên JD, Ngành nghề, Kỹ năng, Yêu cầu, Mức lương, Mô tả chi tiết
           ========================================================================= */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          {/* Khối 1: Tên tin tuyển dụng & Danh mục ngành nghề & Kỹ năng */}
          <section className="space-y-5 rounded-3xl border border-border bg-surface p-5 sm:p-6">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-text-main">
                Thông tin công việc
              </h2>
            </div>

            <div className="space-y-4">
              {/* Tên công việc (Job Title) */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-xs font-semibold text-text-main"
                >
                  Tiêu đề tin tuyển dụng <span className="text-status-error">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleTextChange}
                  placeholder="Ví dụ: Senior Backend Developer (.NET Core / Java)"
                  className={inputClassName}
                />
                <FieldError message={fieldErrors.title} />
              </div>

              {/* Ngành nghề tuyển dụng */}
              <IndustrySelect
                selectedIds={formData.industryIds}
                onChange={(ids) => updateForm("industryIds", ids)}
                error={fieldErrors.industryIds}
              />

              {/* Kỹ năng chuyên môn */}
              <SkillSelect
                selectedIds={formData.skillIds}
                onChange={(ids) => updateForm("skillIds", ids)}
                error={fieldErrors.skillIds}
              />
            </div>
          </section>

          {/* Khối 2: Yêu cầu và chế độ đãi ngộ */}
          <section className="space-y-5 rounded-3xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 border-b border-border pb-3 text-primary">
              <GraduationCap className="size-4" />
              <h2 className="text-sm font-semibold text-text-main">
                Yêu cầu tuyển dụng & Chế độ đãi ngộ
              </h2>
            </div>

            <div className="space-y-4">
              {/* Hình thức làm việc (Employment Type - JobType) */}
              <BadgeSelector
                label="Hình thức làm việc"
                required
                options={JOB_TYPE_OPTIONS}
                value={formData.jobType}
                onChange={(value) => updateForm("jobType", value)}
              />

              {/* Cấp bậc & Trình độ học vấn */}
              <div className="grid gap-4 sm:grid-cols-2">
                <BadgeSelector
                  label="Cấp bậc"
                  required
                  options={JOB_LEVEL_OPTIONS}
                  value={formData.jobLevel}
                  onChange={(value) => updateForm("jobLevel", value)}
                />

                <BadgeSelector
                  label="Trình độ học vấn"
                  required
                  options={EDUCATION_LEVEL_OPTIONS}
                  value={formData.educationLevel}
                  onChange={(value) => updateForm("educationLevel", value)}
                />
              </div>

              {/* Số lượng tuyển & Kinh nghiệm */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="vacancies"
                    className="mb-1.5 block text-xs font-semibold text-text-main"
                  >
                    Số lượng tuyển <span className="text-status-error">*</span>
                  </label>
                  <input
                    id="vacancies"
                    name="vacancies"
                    type="number"
                    min="1"
                    value={formData.vacancies}
                    onChange={handleTextChange}
                    className={inputClassName}
                  />
                  <FieldError message={fieldErrors.vacancies} />
                </div>

                <div>
                  <label
                    htmlFor="experienceYears"
                    className="mb-1.5 block text-xs font-semibold text-text-main"
                  >
                    Kinh nghiệm yêu cầu (năm){" "}
                    <span className="text-status-error">*</span>
                  </label>
                  <input
                    id="experienceYears"
                    name="experienceYears"
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={handleTextChange}
                    className={inputClassName}
                  />
                  <FieldError message={fieldErrors.experienceYears} />
                </div>
              </div>

              {/* Mức lương (Salary / Compensation) */}
              <div className="space-y-3 rounded-2xl border border-border/80 bg-bg/50 p-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-text-main">
                    <DollarSign className="size-3.5 text-primary" />
                    <span>Mức lương dự kiến</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-text-main select-none">
                    <input
                      type="checkbox"
                      checked={formData.salaryNegotiable}
                      onChange={(e) =>
                        updateForm("salaryNegotiable", e.target.checked)
                      }
                      className="size-4 rounded accent-primary"
                    />
                    <span>Mức lương thỏa thuận</span>
                  </label>
                </div>

                {!formData.salaryNegotiable && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="salaryMin"
                        className="mb-1 block text-[11px] text-text-muted"
                      >
                        Lương tối thiểu (VNĐ)
                      </label>
                      <input
                        id="salaryMin"
                        name="salaryMin"
                        type="number"
                        min="0"
                        step="500000"
                        placeholder="Ví dụ: 15000000"
                        value={formData.salaryMin}
                        onChange={handleTextChange}
                        className={inputClassName}
                      />
                      <FieldError message={fieldErrors.salaryMin} />
                    </div>

                    <div>
                      <label
                        htmlFor="salaryMax"
                        className="mb-1 block text-[11px] text-text-muted"
                      >
                        Lương tối đa (VNĐ)
                      </label>
                      <input
                        id="salaryMax"
                        name="salaryMax"
                        type="number"
                        min="0"
                        step="500000"
                        placeholder="Ví dụ: 30000000"
                        value={formData.salaryMax}
                        onChange={handleTextChange}
                        className={inputClassName}
                      />
                      <FieldError message={fieldErrors.salaryMax} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Khối 3: Mô tả công việc chi tiết */}
          <section className="space-y-4 rounded-3xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 border-b border-border pb-3 text-primary">
              <Users className="size-4" />
              <h2 className="text-sm font-semibold text-text-main">
                Mô tả công việc chi tiết
              </h2>
            </div>

            <div className="space-y-4">
              {/* Mô tả công việc */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-xs font-semibold text-text-main"
                >
                  Mô tả vai trò <span className="text-status-error">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleTextChange}
                  placeholder="Mô tả các nhiệm vụ chính, phạm vi công việc và mục tiêu của vị trí…"
                  className={`${inputClassName} resize-y leading-relaxed`}
                />
                <FieldError message={fieldErrors.description} />
              </div>

              {/* Yêu cầu ứng viên */}
              <div>
                <label
                  htmlFor="requirements"
                  className="mb-1.5 block text-xs font-semibold text-text-main"
                >
                  Yêu cầu đối với ứng viên <span className="text-status-error">*</span>
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows={5}
                  value={formData.requirements}
                  onChange={handleTextChange}
                  placeholder="Yêu cầu về kinh nghiệm làm việc, năng lực chuyên môn, thái độ và kỹ năng mềm…"
                  className={`${inputClassName} resize-y leading-relaxed`}
                />
                <FieldError message={fieldErrors.requirements} />
              </div>

              {/* Quyền lợi & Đãi ngộ */}
              <div>
                <label
                  htmlFor="benefits"
                  className="mb-1.5 block text-xs font-semibold text-text-main"
                >
                  Quyền lợi & Đãi ngộ
                </label>
                <textarea
                  id="benefits"
                  name="benefits"
                  rows={4}
                  value={formData.benefits}
                  onChange={handleTextChange}
                  placeholder="Chế độ bảo hiểm, thưởng, phụ cấp, thiết bị làm việc…"
                  className={`${inputClassName} resize-y leading-relaxed`}
                />
              </div>
            </div>
          </section>
        </div>

        {/* =========================================================================
            CỘT PHẢI (lg:col-span-5 xl:col-span-4): Doanh nghiệp & Vị trí & Lưu
            Employer Info (Read-only), Vị trí làm việc, Môi trường, Hạn chót
           ========================================================================= */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:col-span-5 xl:col-span-4">
          <div className="space-y-5 rounded-3xl border border-border bg-surface p-5 shadow-xs sm:p-6">
            {/* Header card bên phải */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-text-main">
                Doanh nghiệp & Địa điểm
              </h2>
              {company?.verificationStatus === "Verified" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <ShieldCheck className="size-3" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            {/* Thông tin Doanh nghiệp tuyển dụng (Cố định, không cho phép đổi công ty khi sửa JD) */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-text-main">
                Doanh nghiệp đăng tin
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-bg/50 p-3">
                <CompanyLogo
                  logoUrl={company?.logoUrl || job.company?.logoUrl}
                  name={company?.name || job.company?.name || "Doanh nghiệp"}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-text-main">
                    {company?.name || job.company?.name || "Doanh nghiệp"}
                  </p>
                  <p className="truncate text-[11px] text-text-muted">
                    {company?.taxCode ? `MST: ${company.taxCode}` : job.company?.address || "Đã xác nhận"}
                  </p>
                </div>
              </div>
            </div>

            {/* Vị trí làm việc (LocationSelector: Province, Ward, Detailed Location) */}
            <div className="border-t border-border pt-4">
              <LocationSelector
                provinceId={formData.provinceId}
                wardId={formData.wardId}
                detailedLocation={formData.detailedLocation}
                onChangeProvince={handleProvinceChange}
                onChangeWard={(wardId) => updateForm("wardId", wardId)}
                onChangeDetailedLocation={(value) =>
                  updateForm("detailedLocation", value)
                }
                errors={{
                  provinceId: fieldErrors.provinceId,
                  wardId: fieldErrors.wardId,
                }}
              />
            </div>

            {/* Môi trường làm việc (WorkMode: Onsite, Hybrid, Remote) */}
            <div className="border-t border-border pt-4">
              <BadgeSelector
                label="Môi trường làm việc"
                required
                options={WORK_MODE_OPTIONS}
                value={formData.workMode}
                onChange={(value) => updateForm("workMode", value)}
              />
            </div>

            {/* Hạn nhận hồ sơ (Deadline) */}
            <div className="border-t border-border pt-4">
              <label
                htmlFor="deadline"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-text-main"
              >
                <span>Hạn nhận hồ sơ</span>
                <span className="text-status-error">*</span>
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                min={dayjs().format("YYYY-MM-DD")}
                value={formData.deadline}
                onChange={handleTextChange}
                className={inputClassName}
              />
              <FieldError message={fieldErrors.deadline} />
            </div>

            {/* Nút thao tác Lưu & Hủy */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  navigate(PATHS.RECRUITER.JOB_DETAIL.replace(":id", job.id))
                }
                className="px-4! py-2! text-xs!"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={Save}
                iconSize={15}
                isLoading={updateJobPostingMutation.isPending}
                className="px-5! py-2! text-xs! font-semibold!"
              >
                <span>Lưu thay đổi</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

/**
 * Trang Chỉnh sửa Tin tuyển dụng (`/recruiter/jobs/:id/edit`)
 */
export function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: job, isLoading: isLoadingJob } = useJobPostingDetail(id);
  const { data: myCompanies = [], isLoading: isLoadingCompanies } = useMyCompanies();

  const selectedCompany = useMemo(() => {
    if (!job?.companyId || myCompanies.length === 0) return undefined;
    return myCompanies.find((c) => c.id === job.companyId);
  }, [job?.companyId, myCompanies]);

  const isMyCompany = Boolean(selectedCompany);
  const isLoading = isLoadingJob || isLoadingCompanies;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 pb-12">
        <div className="h-8 w-44 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-3xl border border-border bg-surface p-6" />
      </main>
    );
  }

  if (!job) {
    return (
      <main className="mx-auto w-full max-w-2xl space-y-4 py-16 text-center">
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-xs">
          <h2 className="text-base font-bold text-text-main">
            Không tìm thấy tin tuyển dụng
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Tin tuyển dụng không tồn tại hoặc đã bị xóa khỏi hệ thống.
          </p>
          <Button
            variant="primary"
            icon={ArrowLeft}
            onClick={() => navigate(PATHS.RECRUITER.JOBS)}
            className="mt-4! px-4! py-2! text-xs! font-semibold!"
          >
            Quay lại danh sách JD
          </Button>
        </div>
      </main>
    );
  }

  if (!isMyCompany) {
    return (
      <main className="mx-auto w-full max-w-2xl space-y-4 py-16 text-center">
        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-8 shadow-xs">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Building2 className="size-6" />
          </div>
          <h2 className="mt-3 text-base font-bold text-slate-800">
            Không có quyền chỉnh sửa
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Bạn không thuộc doanh nghiệp sở hữu tin tuyển dụng này. Chỉ thành viên của công ty mới có quyền cập nhật thông tin.
          </p>
          <Button
            variant="primary"
            icon={ArrowLeft}
            onClick={() => navigate(PATHS.RECRUITER.JOBS)}
            className="mt-4! px-4! py-2! text-xs! font-semibold!"
          >
            Quay lại danh sách JD
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {/* Header thanh điều hướng */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(PATHS.RECRUITER.JOB_DETAIL.replace(":id", job.id))}
            className="mb-2 inline-flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            <span>Quay lại chi tiết tin</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-text-main sm:text-2xl">
            Chỉnh sửa tin tuyển dụng
          </h1>
          <p className="text-xs text-text-muted">
            Cập nhật nội dung mô tả, yêu cầu kỹ năng, địa điểm hoặc thời hạn nhận hồ sơ
          </p>
        </div>
      </div>

      {/* Render EditJobForm bằng keying job.id để form mount sạch sẽ, không dùng setState trong useEffect */}
      <EditJobForm key={job.id} job={job} company={selectedCompany} />
    </main>
  );
}
