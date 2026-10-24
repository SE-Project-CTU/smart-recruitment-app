import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import Button from "@/components/Button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BadgeSelector from "@/components/common/BadgeSelector";
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
  formatSalaryRange,
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
    <p className="mt-1.5 flex items-center gap-1 text-xs text-status-error">
      <AlertCircle className="size-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

const inputClassName =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text-main outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20";

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedCompanyId = searchParams.get("companyId") ?? "";
  const { data: companies = [], isLoading: isLoadingCompanies, isError } =
    useMyCompanies();
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
      errors.companyId = "Vui lòng chọn doanh nghiệp mà bạn đang là thành viên.";
    } else if (!isCompanyVerified) {
      errors.companyId = "Doanh nghiệp cần được xác thực trước khi đăng tin.";
    }
    if (!formData.title.trim()) errors.title = "Vui lòng nhập tiêu đề công việc.";
    if (!formData.provinceId) errors.provinceId = "Vui lòng chọn tỉnh/thành phố.";
    if (formData.vacancies < 1) errors.vacancies = "Số lượng tuyển phải lớn hơn 0.";
    if (formData.experienceYears < 0) errors.experienceYears = "Kinh nghiệm không thể âm.";
    if (formData.industryIds.length === 0) errors.industryIds = "Vui lòng chọn ít nhất một ngành nghề.";
    if (formData.skillIds.length === 0) errors.skillIds = "Vui lòng chọn ít nhất một kỹ năng.";
    if (formData.description.trim().length < 20) errors.description = "Mô tả cần có ít nhất 20 ký tự.";
    if (formData.requirements.trim().length < 20) errors.requirements = "Yêu cầu cần có ít nhất 20 ký tự.";
    if (!formData.salaryNegotiable) {
      const min = Number(formData.salaryMin);
      const max = Number(formData.salaryMax);
      if (formData.salaryMin && min < 0) errors.salaryMin = "Mức lương không thể âm.";
      if (formData.salaryMax && max < 0) errors.salaryMax = "Mức lương không thể âm.";
      if (formData.salaryMin && formData.salaryMax && min > max) {
        errors.salaryMax = "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu.";
      }
    }
    if (!formData.deadline || dayjs(formData.deadline).isBefore(dayjs(), "day")) {
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
      salaryMin: !formData.salaryNegotiable && formData.salaryMin
        ? Number(formData.salaryMin)
        : null,
      salaryMax: !formData.salaryNegotiable && formData.salaryMax
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
        description: `Đã gửi tin tuyển dụng “${result.title}” để xử lý.`,
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
        description: getApiErrorMessage(error, "Không thể tạo tin tuyển dụng. Vui lòng thử lại."),
      });
    }
  };

  const availableCompanies = companies;
  const previewSalary = formatSalaryRange(
    formData.salaryMin ? Number(formData.salaryMin) : null,
    formData.salaryMax ? Number(formData.salaryMax) : null,
    formData.salaryNegotiable,
  );

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Quay lại
          </button>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BriefcaseBusiness className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-main">Tạo tin tuyển dụng</h1>
              <p className="mt-1 text-sm text-text-muted">Hoàn thiện thông tin để ứng viên tìm thấy cơ hội phù hợp.</p>
            </div>
          </div>
        </div>
      </div>

      {isLoadingCompanies ? (
        <div className="animate-pulse rounded-2xl bg-surface p-6 text-sm text-text-muted">Đang tải doanh nghiệp…</div>
      ) : isError ? (
        <div className="rounded-2xl bg-status-error/5 p-5 text-sm text-status-error">Không tải được danh sách doanh nghiệp. Vui lòng tải lại trang.</div>
      ) : availableCompanies.length === 0 ? (
        <section className="space-y-3 rounded-2xl bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-main">Chưa có doanh nghiệp để đăng tin</h2>
          <p className="text-sm text-text-muted">Bạn cần là thành viên của ít nhất một doanh nghiệp để bắt đầu tạo tin tuyển dụng.</p>
          <Button variant="primary" onClick={() => navigate(PATHS.RECRUITER.COMPANY_MANAGEMENT)}>Quản lý doanh nghiệp</Button>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="space-y-4 rounded-2xl bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary">
              <Building2 className="size-4" />
              <h2 className="text-base font-semibold text-text-main">Doanh nghiệp tuyển dụng</h2>
            </div>
            {requestedCompanyId ? (
              selectedCompany ? (
                <CompanySummary company={selectedCompany} />
              ) : (
                <div className="rounded-xl bg-status-error/5 p-4 text-sm text-status-error">
                  Không tìm thấy doanh nghiệp này trong danh sách bạn được phép quản lý.
                </div>
              )
            ) : (
              <div className="space-y-2">
                <label htmlFor="companyId" className="text-sm font-medium text-text-main">Chọn doanh nghiệp</label>
                <Select
                  value={companyId || null}
                  onValueChange={(value) => updateForm("companyId", String(value ?? ""))}
                >
                  <SelectTrigger
                    id="companyId"
                    aria-label="Chọn doanh nghiệp đăng tin"
                    className="h-12! w-full! rounded-xl! border-border! bg-surface! px-3.5! text-sm! text-text-main! shadow-none! focus-visible:border-primary! focus-visible:ring-1! focus-visible:ring-primary/20! aria-expanded:border-primary! aria-expanded:ring-1! aria-expanded:ring-primary/20! md:h-11!"
                  >
                    <SelectValue placeholder="-- Chọn doanh nghiệp --">
                      {(value) => {
                        const company = companies.find((item) => item.id === value);
                        return company ? (
                          <CompanySelectLabel company={company} />
                        ) : (
                          <span className="text-text-muted">-- Chọn doanh nghiệp --</span>
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-76! rounded-2xl! border! border-border! bg-surface! p-1! shadow-md!">
                    {companies.map((company) => (
                      <SelectItem
                        key={company.id}
                        value={company.id}
                        label={company.name}
                        className="min-h-14! rounded-xl! py-2! pr-9! pl-2! text-text-main! data-[highlighted]:bg-bg!"
                      >
                        <CompanySelectLabel company={company} showTaxCode />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={fieldErrors.companyId} />
              </div>
            )}
            {selectedCompany && (
              <div className={isCompanyVerified ? "flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800" : "flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"}>
                {isCompanyVerified ? <ShieldCheck className="mt-0.5 size-4 shrink-0" /> : <Clock3 className="mt-0.5 size-4 shrink-0" />}
                <span>{isCompanyVerified ? "Doanh nghiệp đã xác thực và có thể đăng tin." : "Doanh nghiệp chưa được xác thực. Theo BR-01, bạn cần chờ phê duyệt trước khi đăng tin."}</span>
              </div>
            )}
          </section>

          <section className="space-y-5 rounded-2xl bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary">
              <BriefcaseBusiness className="size-4" />
              <h2 className="text-base font-semibold text-text-main">Thông tin vị trí</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-text-main">Tiêu đề công việc <span className="text-status-error">*</span></label>
                <input id="title" name="title" value={formData.title} onChange={handleTextChange} placeholder="Ví dụ: Backend Developer (.NET)" className={inputClassName} />
                <FieldError message={fieldErrors.title} />
              </div>
              <div className="sm:col-span-2">
                <LocationSelector
                  provinceId={formData.provinceId}
                  wardId={formData.wardId}
                  detailedLocation={formData.detailedLocation}
                  onChangeProvince={handleProvinceChange}
                  onChangeWard={(wardId) => updateForm("wardId", wardId)}
                  onChangeDetailedLocation={(value) => updateForm("detailedLocation", value)}
                  errors={{ provinceId: fieldErrors.provinceId, wardId: fieldErrors.wardId }}
                />
              </div>
              <div className="sm:col-span-2">
                <BadgeSelector
                  label="Môi trường làm việc"
                  required
                  options={WORK_MODE_OPTIONS}
                  value={formData.workMode}
                  onChange={(value) => updateForm("workMode", value)}
                />
              </div>
              <div className="sm:col-span-2">
                <IndustrySelect selectedIds={formData.industryIds} onChange={(ids) => updateForm("industryIds", ids)} error={fieldErrors.industryIds} />
              </div>
              <div className="sm:col-span-2">
                <SkillSelect selectedIds={formData.skillIds} onChange={(ids) => updateForm("skillIds", ids)} error={fieldErrors.skillIds} />
              </div>
            </div>
          </section>

          <section className="space-y-5 rounded-2xl bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary">
              <GraduationCap className="size-4" />
              <h2 className="text-base font-semibold text-text-main">Yêu cầu và chế độ</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <BadgeSelector label="Cấp bậc" required options={JOB_LEVEL_OPTIONS} value={formData.jobLevel} onChange={(value) => updateForm("jobLevel", value)} />
              <BadgeSelector label="Trình độ học vấn" required options={EDUCATION_LEVEL_OPTIONS} value={formData.educationLevel} onChange={(value) => updateForm("educationLevel", value)} />
              <BadgeSelector label="Hình thức làm việc" required options={JOB_TYPE_OPTIONS} value={formData.jobType} onChange={(value) => updateForm("jobType", value)} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="vacancies" className="mb-1.5 block text-sm font-medium text-text-main">Số lượng tuyển</label>
                  <input id="vacancies" name="vacancies" type="number" min="1" value={formData.vacancies} onChange={handleTextChange} className={inputClassName} />
                  <FieldError message={fieldErrors.vacancies} />
                </div>
                <div>
                  <label htmlFor="experienceYears" className="mb-1.5 block text-sm font-medium text-text-main">Kinh nghiệm (năm)</label>
                  <input id="experienceYears" name="experienceYears" type="number" min="0" value={formData.experienceYears} onChange={handleTextChange} className={inputClassName} />
                  <FieldError message={fieldErrors.experienceYears} />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary">
              <Users className="size-4" />
              <h2 className="text-base font-semibold text-text-main">Mô tả công việc</h2>
            </div>
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-text-main">Mô tả <span className="text-status-error">*</span></label>
              <textarea id="description" name="description" rows={6} value={formData.description} onChange={handleTextChange} placeholder="Giới thiệu vai trò, công việc hằng ngày và đội ngũ…" className={`${inputClassName} resize-y`} />
              <FieldError message={fieldErrors.description} />
            </div>
            <div>
              <label htmlFor="requirements" className="mb-1.5 block text-sm font-medium text-text-main">Yêu cầu ứng viên <span className="text-status-error">*</span></label>
              <textarea id="requirements" name="requirements" rows={5} value={formData.requirements} onChange={handleTextChange} placeholder="Kinh nghiệm, kỹ năng và tiêu chí cần có…" className={`${inputClassName} resize-y`} />
              <FieldError message={fieldErrors.requirements} />
            </div>
            <div>
              <label htmlFor="benefits" className="mb-1.5 block text-sm font-medium text-text-main">Quyền lợi</label>
              <textarea id="benefits" name="benefits" rows={4} value={formData.benefits} onChange={handleTextChange} placeholder="Lương thưởng, bảo hiểm, chế độ làm việc…" className={`${inputClassName} resize-y`} />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary">
              <CalendarDays className="size-4" />
              <h2 className="text-base font-semibold text-text-main">Mức lương và hạn ứng tuyển</h2>
            </div>
            <label className="flex items-center gap-2 text-sm text-text-main">
              <input type="checkbox" checked={formData.salaryNegotiable} onChange={(event) => updateForm("salaryNegotiable", event.target.checked)} className="size-4 accent-primary" />
              Mức lương thỏa thuận
            </label>
            {!formData.salaryNegotiable && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="salaryMin" className="mb-1.5 block text-sm font-medium text-text-main">Lương tối thiểu (VNĐ/tháng)</label>
                  <input id="salaryMin" name="salaryMin" type="number" min="0" value={formData.salaryMin} onChange={handleTextChange} className={inputClassName} />
                  <FieldError message={fieldErrors.salaryMin} />
                </div>
                <div>
                  <label htmlFor="salaryMax" className="mb-1.5 block text-sm font-medium text-text-main">Lương tối đa (VNĐ/tháng)</label>
                  <input id="salaryMax" name="salaryMax" type="number" min="0" value={formData.salaryMax} onChange={handleTextChange} className={inputClassName} />
                  <FieldError message={fieldErrors.salaryMax} />
                </div>
              </div>
            )}
            <p className="text-sm text-text-muted">Mức lương hiển thị: <span className="font-semibold text-text-main">{previewSalary}</span></p>
            <div>
              <label htmlFor="deadline" className="mb-1.5 block text-sm font-medium text-text-main">Hạn nhận hồ sơ</label>
              <input id="deadline" name="deadline" type="date" min={dayjs().format("YYYY-MM-DD")} value={formData.deadline} onChange={handleTextChange} className={inputClassName} />
              <FieldError message={fieldErrors.deadline} />
            </div>
          </section>

          {fieldErrors.companyId && selectedCompany && <FieldError message={fieldErrors.companyId} />}
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => navigate(-1)}>Hủy</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!selectedCompany || !isCompanyVerified}>
              <CheckCircle2 className="size-4" />
              Gửi tin tuyển dụng
            </Button>
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
  const verificationLabel = company.verificationStatus === "Verified"
    ? "Đã xác thực"
    : company.verificationStatus === "Rejected"
      ? "Bị từ chối"
      : "Chờ xác thực";

  return (
    <span className="flex min-w-0 items-center gap-3">
      <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="sm" />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-text-main">{company.name}</span>
        {showTaxCode && (
          <span className="truncate text-xs text-text-muted">
            MST {company.taxCode} · {verificationLabel}
          </span>
        )}
      </span>
    </span>
  );
}

function CompanySummary({ company }: { company: CompanyItem }) {
  const isVerified = company.verificationStatus === "Verified";
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-bg p-4 sm:flex-row sm:items-center">
      <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="md" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-text-main">{company.name}</h3>
        <p className="mt-1 text-sm text-text-muted">Mã số thuế: {company.taxCode}</p>
        {company.address && <p className="mt-1 flex items-center gap-1 text-sm text-text-muted"><MapPin className="size-3.5" />{company.address}</p>}
      </div>
      <span className={isVerified ? "inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700" : "inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"}>
        {isVerified ? <ShieldCheck className="size-3.5" /> : <Clock3 className="size-3.5" />}
        {isVerified ? "Đã xác thực" : company.verificationStatus === "Rejected" ? "Bị từ chối" : "Chờ xác thực"}
      </span>
    </div>
  );
}
