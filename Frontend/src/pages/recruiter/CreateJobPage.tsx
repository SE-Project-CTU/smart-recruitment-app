import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  AlertCircle,
  ArrowLeft,
  DollarSign,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";
import { BadgeSelector, Button } from "@/components/common";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import IndustrySelect from "@/components/catalog/IndustrySelect";
import LocationSelector from "@/components/catalog/LocationSelector";
import SkillSelect from "@/components/catalog/SkillSelect";
import { toast } from "@/components/ui/toast";
import { getApiErrorMessage, getApiFieldErrors } from "@/api/errorHandler";
import { PATHS } from "@/constants/paths";
import { useMyCompanies } from "@/hooks/queries/useCompany";
import { useCreateJobPosting } from "@/hooks/queries/useJob";
import {
  EDUCATION_LEVEL_OPTIONS,
  JOB_LEVEL_OPTIONS,
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
} from "@/utils/jobHelpers";
import type {
  CreateJobPostingPayload,
  EducationLevel,
  JobLevel,
  JobType,
  WorkMode,
} from "@/types";
import type { CompanyItem } from "@/types/company";

interface JobFormState {
  companyId: string;
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

const initialFormState = (companyId: string): JobFormState => ({
  companyId,
  title: "",
  provinceId: "",
  wardId: "",
  detailedLocation: "",
  experienceYears: 1,
  jobLevel: "Staff",
  educationLevel: "Bachelor",
  vacancies: 1,
  workMode: "Onsite",
  jobType: "FullTime",
  description: "",
  requirements: "",
  benefits: "",
  salaryMin: "",
  salaryMax: "",
  salaryNegotiable: false,
  deadline: dayjs().add(30, "day").format("YYYY-MM-DD"),
  industryIds: [],
  skillIds: [],
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

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedCompanyId = searchParams.get("companyId") ?? "";

  const {
    data: companies = [],
    isLoading: isLoadingCompanies,
    isError,
  } = useMyCompanies();

  const { mutateAsync: createJobPosting, isPending: isSubmitting } =
    useCreateJobPosting();

  const [formData, setFormData] = useState<JobFormState>(() =>
    initialFormState(requestedCompanyId),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const companyId = requestedCompanyId || formData.companyId;
  const selectedCompany = companies.find((company) => company.id === companyId);
  const isCompanyVerified = selectedCompany?.verificationStatus === "Verified";

  const updateForm = <K extends keyof JobFormState>(
    key: K,
    value: JobFormState[K],
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
      updateForm(name, Number(value) as JobFormState[typeof name]);
      return;
    }
    if (name in formData) {
      updateForm(name as keyof JobFormState, value as never);
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
    if (!companyId || !selectedCompany) {
      errors.companyId =
        "Vui lòng chọn doanh nghiệp mà bạn đang là thành viên.";
    } else if (!isCompanyVerified) {
      errors.companyId = "Doanh nghiệp cần được xác thực trước khi đăng tin.";
    }
    if (!formData.title.trim())
      errors.title = "Vui lòng nhập tiêu đề công việc.";
    if (!formData.provinceId)
      errors.provinceId = "Vui lòng chọn tỉnh/thành phố.";
    if (formData.vacancies < 1)
      errors.vacancies = "Số lượng tuyển phải lớn hơn 0.";
    if (formData.experienceYears < 0)
      errors.experienceYears = "Kinh nghiệm không thể âm.";
    if (formData.industryIds.length === 0)
      errors.industryIds = "Vui lòng chọn ít nhất một ngành nghề.";
    if (formData.skillIds.length === 0)
      errors.skillIds = "Vui lòng chọn ít nhất một kỹ năng.";
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

    const payload: CreateJobPostingPayload = {
      companyId,
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
      const result = await createJobPosting(payload);
      toast.add({
        type: "success",
        description: `Đã gửi tin tuyển dụng “${result.title}” thành công.`,
      });
      navigate(`${PATHS.RECRUITER.COMPANY_MANAGEMENT}/${companyId}/overview`);
    } catch (error: unknown) {
      const apiErrors = getApiFieldErrors(error);
      if (Object.keys(apiErrors).length > 0) {
        setFieldErrors(apiErrors);
        return;
      }
      toast.add({
        type: "destructive",
        description: getApiErrorMessage(
          error,
          "Không thể tạo tin tuyển dụng. Vui lòng thử lại.",
        ),
      });
    }
  };

  const availableCompanies = companies;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {/* Thanh tiêu đề trên cùng */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-2 inline-flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            <span>Quay lại</span>
          </button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-text-main sm:text-2xl">
                Tạo tin tuyển dụng
              </h1>
              <p className="text-xs text-text-muted">
                Hoàn thiện thông tin vị trí để kết nối nhanh chóng với ứng viên
                tiềm năng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoadingCompanies ? (
        <div className="animate-pulse rounded-3xl border border-border bg-surface p-8 text-center text-xs text-text-muted">
          Đang tải danh sách doanh nghiệp…
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-xs text-status-error">
          Không tải được danh sách doanh nghiệp. Vui lòng thử tải lại trang.
        </div>
      ) : availableCompanies.length === 0 ? (
        <section className="space-y-4 rounded-3xl border border-border bg-surface p-8 text-center">
          <h2 className="text-base font-semibold text-text-main">
            Chưa có doanh nghiệp để đăng tin
          </h2>
          <p className="text-xs text-text-muted">
            Bạn cần thuộc về ít nhất một doanh nghiệp đã xác thực để bắt đầu tạo
            JD tuyển dụng.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate(PATHS.RECRUITER.COMPANY_MANAGEMENT)}
            className="px-4! py-2! text-xs!"
          >
            Quản lý doanh nghiệp
          </Button>
        </section>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* LAYOUT 2 CỘT (Cột trái: Detail về JD - Cột phải: Thông tin Doanh nghiệp & Địa điểm) */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* =========================================================================
                CỘT TRÁI (lg:col-span-7 xl:col-span-8): Chi tiết JD
                Tên JD, Ngành nghề, Kỹ năng, Yêu cầu & Chế độ, Mô tả chi tiết
               ========================================================================= */}
            <div className="space-y-6 lg:col-span-7 xl:col-span-8">
              {/* Khối 1: Tên tin tuyển dụng & Danh mục ngành nghề & Kỹ năng */}
              <section className="space-y-5 rounded-3xl border border-border bg-surface p-5 sm:p-6">
                <div className="flex items-center gap-2 border-b border-border pb-3 text-primary">
                  <h2 className="text-sm font-semibold text-text-main">
                    Thông tin công việc
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Tên công việc (Job Title) */}
                  <div className="mb-4">
                    <label
                      htmlFor="title"
                      className="mb-1.5 block text-xs font-semibold text-text-main"
                    >
                      Tiêu đề tin tuyển dụng
                      <span className="text-status-error">*</span>
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

                  {/* Ngành nghề tuyển dụng (Job Category) */}
                  <IndustrySelect
                    selectedIds={formData.industryIds}
                    onChange={(ids) => updateForm("industryIds", ids)}
                    error={fieldErrors.industryIds}
                  />

                  {/* Kỹ năng chuyên môn (Skills) */}
                  <SkillSelect
                    selectedIds={formData.skillIds}
                    onChange={(ids) => updateForm("skillIds", ids)}
                    error={fieldErrors.skillIds}
                  />
                </div>
              </section>

              {/* Khối 2: Yêu cầu và chế độ đãi ngộ (Requirements & Compensation) */}
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
                        Số lượng tuyển{" "}
                        <span className="text-status-error">*</span>
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
                      placeholder="Mô tả các nhiệm vụ chính, phạm vi công việc và mục tiêu của vị trí tuyển dụng…"
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
                      Yêu cầu đối với ứng viên{" "}
                      <span className="text-status-error">*</span>
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
                      placeholder="Chế độ bảo hiểm, thưởng tháng 13, phụ cấp, thiết bị làm việc, du lịch hàng năm…"
                      className={`${inputClassName} resize-y leading-relaxed`}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* =========================================================================
                CỘT PHẢI (lg:col-span-5 xl:col-span-4): Thông tin Doanh nghiệp & Vị trí
                Employer Details, Chi nhánh / Địa chỉ, Môi trường làm việc, Deadline
               ========================================================================= */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:col-span-5 xl:col-span-4">
              <div className="space-y-5 rounded-3xl border border-border bg-surface p-5 shadow-xs sm:p-6">
                {/* Header card bên phải */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2 text-primary">
                    <h2 className="text-sm font-semibold text-text-main">
                      Thông tin doanh nghiệp
                    </h2>
                  </div>
                  {isCompanyVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <ShieldCheck className="size-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                {/* 1. Doanh nghiệp tuyển dụng (Company Selector / Summary) */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-text-main">
                    Doanh nghiệp tuyển dụng{" "}
                    <span className="text-status-error">*</span>
                  </label>

                  <div>
                    <Select
                      value={companyId || null}
                      onValueChange={(value) =>
                        updateForm("companyId", String(value ?? ""))
                      }
                    >
                      <SelectTrigger
                        id="companyId"
                        aria-label="Chọn doanh nghiệp đăng tin"
                        className="h-12! w-full! rounded-xl! border-border! bg-surface! px-3! text-xs! text-text-main! shadow-none! focus-visible:border-primary! focus-visible:ring-1! focus-visible:ring-primary/20!"
                      >
                        <SelectValue placeholder="-- Chọn doanh nghiệp --">
                          {(value) => {
                            const company = companies.find(
                              (item) => item.id === value,
                            );
                            return company ? (
                              <CompanySelectLabel company={company} />
                            ) : (
                              <span className="text-text-muted">
                                -- Chọn doanh nghiệp --
                              </span>
                            );
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-72! rounded-2xl! border! border-border! bg-surface! p-1! shadow-md!">
                        {companies.map((company) => (
                          <SelectItem
                            key={company.id}
                            value={company.id}
                            label={company.name}
                            className="rounded-xl! py-2! pr-8! pl-2! text-text-main! data-highlighted:bg-bg!"
                          >
                            <CompanySelectLabel company={company} showTaxCode />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={fieldErrors.companyId} />
                  </div>
                </div>

                {/* 2. Vị trí làm việc (LocationSelector: Province, Ward, Detailed Location) */}
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

                {/* 3. Môi trường làm việc (WorkMode: Onsite, Hybrid, Remote) */}
                <div className="border-t border-border pt-4">
                  <BadgeSelector
                    label="Môi trường làm việc "
                    required
                    options={WORK_MODE_OPTIONS}
                    value={formData.workMode}
                    onChange={(value) => updateForm("workMode", value)}
                  />
                </div>

                {/* 4. Hạn nhận hồ sơ (Deadline) */}
                <div className="border-t border-border pt-4">
                  <label
                    htmlFor="deadline"
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-text-main"
                  >
                    <span>Hạn nhận hồ sơ </span>
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
                {/* Nút hành động phía dưới cột trái */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate(-1)}
                    className="px-5! py-2! text-xs!"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    disabled={!selectedCompany || !isCompanyVerified}
                    className="px-6! py-2! text-xs! font-semibold!"
                  >
                    <span>Đăng tin tuyển dụng</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </main>
  );
}

function CompanySelectLabel({
  company,
  showTaxCode = false,
}: {
  company: CompanyItem;
  showTaxCode?: boolean;
}) {
  const verificationLabel =
    company.verificationStatus === "Verified"
      ? "Đã xác thực"
      : company.verificationStatus === "Rejected"
        ? "Bị từ chối"
        : "Chờ xác thực";

  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="sm" />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-xs font-medium text-text-main">
          {company.name}
        </span>
        {showTaxCode && (
          <span className="truncate text-[10px] text-text-muted">
            MST {company.taxCode} · {verificationLabel}
          </span>
        )}
      </span>
    </span>
  );
}
