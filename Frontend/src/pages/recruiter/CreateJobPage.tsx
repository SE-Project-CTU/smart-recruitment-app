import { useState, useMemo, useCallback, type ChangeEvent, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { BadgeSelector, Button, DatePicker } from "@/components/common";
import { JobMatchingWeightsCard, type MatchingWeightsValues } from "@/components/job/JobMatchingWeightsCard";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import IndustrySelect from "@/components/catalog/IndustrySelect";
import LocationSelector from "@/components/catalog/LocationSelector";
import SkillSelect from "@/components/catalog/SkillSelect";
import { toast } from "@/components/ui/toast";
import { getApiErrorMessage, getApiFieldErrors } from "@/api/errorHandler";
import { PATHS } from "@/constants/paths";
import { useMyCompanies } from "@/hooks/queries/useCompany";
import { useCreateJobPosting } from "@/hooks/queries/useJob";
import { useCompanyStore } from "@/stores";
import {
  EDUCATION_LEVEL_OPTIONS,
  JOB_LEVEL_OPTIONS,
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
  formatCurrencyInput,
  parseCurrencyInput,
} from "@/utils/jobHelpers";
import type {
  CreateJobPostingPayload,
  EducationLevel,
  JobLevel,
  JobType,
  WorkMode,
} from "@/types";
import { EmptyStreet } from "@/assets/images/decoration";

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
  matchingWeights: MatchingWeightsValues;
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
  matchingWeights: {
    skill: 40,
    experience: 25,
    title: 25,
    other: 10,
  },
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

  // 1. Lấy thông tin Workspace đang kích hoạt qua atomic selectors
  const activeCompanyId = useCompanyStore((s) => s.activeCompanyId);
  const activeCompany = useCompanyStore((s) => s.activeCompany);

  const {
    data: companies = [],
    isLoading: isLoadingCompanies,
    isError,
  } = useMyCompanies();

  const { mutateAsync: createJobPosting, isPending: isSubmitting } =
    useCreateJobPosting();

  // Tìm doanh nghiệp đang đại diện đăng tin
  const selectedCompany = useMemo(() => {
    if (activeCompany) return activeCompany;
    if (activeCompanyId) {
      return companies.find((c) => c.id === activeCompanyId) || null;
    }
    return companies[0] || null;
  }, [activeCompany, activeCompanyId, companies]);

  const companyId = selectedCompany?.id ?? "";
  const isCompanyVerified = selectedCompany?.verificationStatus === "Verified";

  const [formData, setFormData] = useState<JobFormState>(() =>
    initialFormState(companyId),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateForm = useCallback(
    <K extends keyof JobFormState>(key: K, value: JobFormState[K]) => {
      setFormData((current) => ({ ...current, [key]: value }));
      setFieldErrors((current) => {
        if (!(key in current)) return current;
        const next = { ...current };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      if (name === "experienceYears" || name === "vacancies") {
        updateForm(name, Number(value) as JobFormState[typeof name]);
        return;
      }
      updateForm(name as keyof JobFormState, value as never);
    },
    [updateForm],
  );

  const handleSalaryChange = useCallback(
    (
      event: ChangeEvent<HTMLInputElement>,
      field: "salaryMin" | "salaryMax",
    ) => {
      const input = event.target;
      const rawValue = input.value;
      const cursorPosition = input.selectionStart || 0;

      // Đếm số chữ số trước con trỏ trước khi format
      const digitsBeforeCursor = rawValue
        .slice(0, cursorPosition)
        .replace(/\D/g, "").length;

      const formatted = formatCurrencyInput(rawValue);
      updateForm(field, formatted);

      // Bảo toàn vị trí con trỏ sau khi thêm/xóa dấu phẩy
      requestAnimationFrame(() => {
        let newCursorPos = 0;
        let digitCount = 0;
        for (let i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i])) {
            digitCount++;
          }
          if (digitCount === digitsBeforeCursor) {
            newCursorPos = i + 1;
            break;
          }
        }
        if (digitCount < digitsBeforeCursor) {
          newCursorPos = formatted.length;
        }
        input.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    [updateForm],
  );

  const handleProvinceChange = useCallback((provinceId: string) => {
    setFormData((current) => ({ ...current, provinceId, wardId: "" }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.provinceId;
      delete next.wardId;
      return next;
    });
  }, []);

  const handleWardChange = useCallback(
    (wardId: string) => {
      updateForm("wardId", wardId);
    },
    [updateForm],
  );

  const handleDetailedLocationChange = useCallback(
    (detailedLocation: string) => {
      updateForm("detailedLocation", detailedLocation);
    },
    [updateForm],
  );

  const handleIndustryChange = useCallback(
    (ids: string[]) => {
      updateForm("industryIds", ids);
    },
    [updateForm],
  );

  const handleSkillChange = useCallback(
    (ids: string[]) => {
      updateForm("skillIds", ids);
    },
    [updateForm],
  );

  const handleWeightsChange = useCallback(
    (weights: MatchingWeightsValues) => {
      updateForm("matchingWeights", weights);
    },
    [updateForm],
  );

  const handleDeadlineChange = useCallback(
    (val: string) => {
      updateForm("deadline", val);
      setFieldErrors((current) => {
        if (!current.deadline) return current;
        const next = { ...current };
        delete next.deadline;
        return next;
      });
    },
    [updateForm],
  );

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!companyId || !selectedCompany) {
      errors.companyId =
        "Vui lòng chọn doanh nghiệp làm việc tại menu bên trái.";
    } else if (!isCompanyVerified) {
      errors.companyId = "Doanh nghiệp cần được xác thực trước khi đăng tin.";
    }

    const titleTrim = formData.title.trim();
    if (!titleTrim) {
      errors.title = "Vui lòng nhập tiêu đề công việc.";
    } else if (titleTrim.length < 2 || titleTrim.length > 200) {
      errors.title = `Tiêu đề tin tuyển dụng phải từ 2 đến 200 ký tự (hiện có ${titleTrim.length} ký tự).`;
    }

    if (!formData.provinceId) {
      errors.provinceId = "Vui lòng chọn tỉnh/thành phố làm việc.";
    }

    if (formData.vacancies < 1 || formData.vacancies > 1000) {
      errors.vacancies = "Số lượng tuyển dụng hợp lệ từ 1 đến 1,000 người.";
    }

    if (formData.experienceYears < 0 || formData.experienceYears > 60) {
      errors.experienceYears = "Số năm kinh nghiệm hợp lệ từ 0 đến 60 năm.";
    }

    if (formData.industryIds.length === 0) {
      errors.industryIds = "Vui lòng chọn ít nhất một ngành nghề tuyển dụng.";
    }

    if (formData.skillIds.length === 0) {
      errors.skillIds = "Vui lòng chọn ít nhất một kỹ năng chuyên môn.";
    }

    const descTrim = formData.description.trim();
    if (!descTrim) {
      errors.description = "Vui lòng nhập mô tả công việc.";
    } else if (descTrim.length < 20) {
      errors.description = `Mô tả công việc cần tối thiểu 20 ký tự (hiện có ${descTrim.length}/20 ký tự).`;
    }

    const reqTrim = formData.requirements.trim();
    if (!reqTrim) {
      errors.requirements = "Vui lòng nhập yêu cầu công việc.";
    } else if (reqTrim.length < 20) {
      errors.requirements = `Yêu cầu công việc cần tối thiểu 20 ký tự (hiện có ${reqTrim.length}/20 ký tự).`;
    }

    if (formData.detailedLocation && formData.detailedLocation.trim().length > 500) {
      errors.detailedLocation = "Địa chỉ làm việc chi tiết không được vượt quá 500 ký tự.";
    }

    if (formData.benefits && formData.benefits.trim().length > 10000) {
      errors.benefits = "Chế độ đãi ngộ không được vượt quá 10,000 ký tự.";
    }

    if (!formData.deadline) {
      errors.deadline = "Vui lòng chọn hạn nhận hồ sơ.";
    } else if (dayjs(formData.deadline).isBefore(dayjs(), "day")) {
      errors.deadline = "Hạn nhận hồ sơ phải từ ngày hôm nay trở đi.";
    }

    if (!formData.salaryNegotiable) {
      const min = parseCurrencyInput(formData.salaryMin);
      const max = parseCurrencyInput(formData.salaryMax);

      if (!formData.salaryMin && !formData.salaryMax) {
        errors.salaryMin = "Nhập mức lương dự kiến hoặc chọn Lương thỏa thuận.";
      } else {
        if (formData.salaryMin && (min == null || min < 0)) {
          errors.salaryMin = "Mức lương tối thiểu không hợp lệ.";
        }
        if (formData.salaryMax && (max == null || max < 0)) {
          errors.salaryMax = "Mức lương tối đa không hợp lệ.";
        }
        if (min != null && max != null && min > max) {
          errors.salaryMax =
            "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu.";
        }
      }
    }

    const totalWeights =
      formData.matchingWeights.skill +
      formData.matchingWeights.experience +
      formData.matchingWeights.title +
      formData.matchingWeights.other;
    if (Math.abs(totalWeights - 100) > 0.1) {
      errors.matchingWeights = `Tổng trọng số đánh giá hiện tại là ${totalWeights}%. Vui lòng điều chỉnh để đạt chính xác 100%.`;
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
      wardId: formData.wardId || undefined,
      detailedLocation: formData.detailedLocation.trim() || undefined,
      experienceYears: formData.experienceYears,
      jobLevel: formData.jobLevel,
      educationLevel: formData.educationLevel,
      vacancies: formData.vacancies,
      workMode: formData.workMode,
      jobType: formData.jobType,
      description: formData.description.trim(),
      requirements: formData.requirements.trim(),
      benefits: formData.benefits.trim() || undefined,
      salaryNegotiable: formData.salaryNegotiable,
      salaryMin:
        formData.salaryNegotiable || !formData.salaryMin
          ? null
          : parseCurrencyInput(formData.salaryMin),
      salaryMax:
        formData.salaryNegotiable || !formData.salaryMax
          ? null
          : parseCurrencyInput(formData.salaryMax),
      deadline: dayjs(formData.deadline).endOf("day").toISOString(),
      industryIds: formData.industryIds,
      skillIds: formData.skillIds,
      skillWeight: formData.matchingWeights.skill,
      experienceWeight: formData.matchingWeights.experience,
      titleWeight: formData.matchingWeights.title,
      otherWeight: formData.matchingWeights.other,
    };

    try {
      const created = await createJobPosting(payload);
      toast.add({
        type: "success",
        description: "Tạo tin tuyển dụng thành công!",
      });
      navigate(PATHS.RECRUITER.JOB_DETAIL.replace(":id", created.id));
    } catch (error) {
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

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      {/* Thanh tiêu đề trên cùng */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button
            variant="secondary"
            icon={ArrowLeft}
            iconSize={15}
            onClick={() => navigate(-1)}
            className="h-8! px-3! text-xs! font-medium!"
          >
            Quay lại
          </Button>
          <div className="mt-2 flex items-center gap-3">
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
        <div className="animate-pulse rounded-2xl border border-border bg-surface p-8 text-center text-xs text-text-muted">
          Đang tải thông tin doanh nghiệp…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-status-error/30 bg-status-error/10 p-6 text-xs text-status-error">
          Không tải được thông tin doanh nghiệp. Vui lòng thử tải lại trang.
        </div>
      ) : companies.length === 0 ? (
        <section className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <img
            src={EmptyStreet}
            alt="Empty"
            loading="lazy"
            className="h-80 w-auto md:h-100"
          />
          <h2 className="text-base font-semibold text-text-main">
            Chưa có doanh nghiệp để đăng tin
          </h2>
          <p className="text-xs text-text-muted">
            Bạn cần thuộc về ít nhất một doanh nghiệp đã được xác thực để bắt
            đầu tạo JD tuyển dụng.
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
          {/* LAYOUT 2 CỘT (Cột trái: Chi tiết JD - Cột phải: Thông tin Doanh nghiệp & Vị trí) */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* =========================================================================
                CỘT TRÁI (lg:col-span-7 xl:col-span-8): Chi tiết JD
               ========================================================================= */}
            <div className="space-y-6 lg:col-span-7 xl:col-span-8">
              {/* Khối 1: Tên tin tuyển dụng & Ngành nghề & Kỹ năng */}
              <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
                <div className="flex items-center gap-2 border-b border-border pb-3 text-primary">
                  <h2 className="text-sm font-semibold text-text-main">
                    Thông tin công việc
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Tiêu đề tin tuyển dụng */}
                  <div className="mb-4">
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="title"
                        className="block text-xs font-semibold text-text-main"
                      >
                        Tiêu đề tin tuyển dụng
                        <span className="text-status-error">*</span>
                      </label>
                      <span className="text-[11px] text-text-muted">
                        {formData.title.length}/200
                      </span>
                    </div>
                    <input
                      id="title"
                      name="title"
                      maxLength={200}
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
                    onChange={handleIndustryChange}
                    error={fieldErrors.industryIds}
                  />

                  {/* Kỹ năng chuyên môn */}
                  <SkillSelect
                    selectedIds={formData.skillIds}
                    onChange={handleSkillChange}
                    error={fieldErrors.skillIds}
                  />
                </div>
              </section>

              {/* Khối 2: Yêu cầu & Chế độ đãi ngộ */}
              <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
                <div className="flex items-center gap-2 border-b border-border pb-3 text-primary">
                  <h2 className="text-sm font-semibold text-text-main">
                    Yêu cầu tuyển dụng & Chế độ đãi ngộ
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Hình thức làm việc */}
                  <BadgeSelector
                    label="Hình thức làm việc"
                    required
                    options={JOB_TYPE_OPTIONS}
                    value={formData.jobType}
                    onChange={(value) => updateForm("jobType", value)}
                  />

                  {/* Cấp bậc */}
                  <BadgeSelector
                    label="Cấp bậc"
                    required
                    options={JOB_LEVEL_OPTIONS}
                    value={formData.jobLevel}
                    onChange={(value) => updateForm("jobLevel", value)}
                  />

                  {/* Trình độ học vấn */}
                  <BadgeSelector
                    label="Trình độ học vấn tối thiểu"
                    required
                    options={EDUCATION_LEVEL_OPTIONS}
                    value={formData.educationLevel}
                    onChange={(value) => updateForm("educationLevel", value)}
                  />

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
                        Số năm kinh nghiệm tối thiểu
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

                  {/* Mức lương */}
                  <div className="border-t border-border pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-text-main">
                        <DollarSign className="size-4 text-emerald-600" />
                        <span>Mức lương dự kiến</span>
                      </div>
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-text-muted">
                        <input
                          type="checkbox"
                          checked={formData.salaryNegotiable}
                          onChange={(e) =>
                            updateForm("salaryNegotiable", e.target.checked)
                          }
                          className="size-3.5 rounded border-border text-primary focus:ring-primary"
                        />
                        <span>Lương thỏa thuận</span>
                      </label>
                    </div>

                    {!formData.salaryNegotiable && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                            type="text"
                            inputMode="numeric"
                            placeholder="Ví dụ: 15,000,000"
                            value={formData.salaryMin}
                            onChange={(e) => handleSalaryChange(e, "salaryMin")}
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
                            type="text"
                            inputMode="numeric"
                            placeholder="Ví dụ: 30,000,000"
                            value={formData.salaryMax}
                            onChange={(e) => handleSalaryChange(e, "salaryMax")}
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
              <section className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
                <div className="flex items-center gap-2 border-b border-border pb-3 text-primary">
                  <h2 className="text-sm font-semibold text-text-main">
                    Mô tả công việc chi tiết
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Mô tả công việc */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="description"
                        className="block text-xs font-semibold text-text-main"
                      >
                        Mô tả vai trò <span className="text-status-error">*</span>
                      </label>
                      <span
                        className={cn(
                          "text-[11px]",
                          formData.description.trim().length >= 20
                            ? "font-medium text-emerald-600"
                            : "text-text-muted",
                        )}
                      >
                        {formData.description.trim().length}/20 ký tự tối thiểu
                      </span>
                    </div>
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
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="requirements"
                        className="block text-xs font-semibold text-text-main"
                      >
                        Yêu cầu đối với ứng viên{" "}
                        <span className="text-status-error">*</span>
                      </label>
                      <span
                        className={cn(
                          "text-[11px]",
                          formData.requirements.trim().length >= 20
                            ? "font-medium text-emerald-600"
                            : "text-text-muted",
                        )}
                      >
                        {formData.requirements.trim().length}/20 ký tự tối thiểu
                      </span>
                    </div>
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
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="benefits"
                        className="block text-xs font-semibold text-text-main"
                      >
                        Quyền lợi & Đãi ngộ
                      </label>
                      <span className="text-[11px] text-text-muted">
                        {formData.benefits.length}/10000
                      </span>
                    </div>
                    <textarea
                      id="benefits"
                      name="benefits"
                      rows={4}
                      maxLength={10000}
                      value={formData.benefits}
                      onChange={handleTextChange}
                      placeholder="Chế độ bảo hiểm, thưởng tháng 13, phụ cấp, thiết bị làm việc, du lịch hàng năm…"
                      className={`${inputClassName} resize-y leading-relaxed`}
                    />
                  </div>
                </div>
              </section>

              {/* KHỐI 4: Trọng số đánh giá ứng viên (AI Match Weights) */}
              <JobMatchingWeightsCard
                weights={formData.matchingWeights}
                onChange={handleWeightsChange}
                error={fieldErrors.matchingWeights}
              />
            </div>

            {/* =========================================================================
                CỘT PHẢI (lg:col-span-5 xl:col-span-4): Thông tin Doanh nghiệp & Vị trí
               ========================================================================= */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:col-span-5 xl:col-span-4">
              <div className="space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-6">
                {/* Header card bên phải */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2 text-primary">
                    <h2 className="text-sm font-semibold text-text-main">
                      Doanh nghiệp tuyển dụng
                    </h2>
                  </div>
                  {isCompanyVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <ShieldCheck className="size-3" />
                      <span>Đã xác thực</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      <Clock className="size-3" />
                      <span>
                        {selectedCompany?.verificationStatus || "Chờ duyệt"}
                      </span>
                    </span>
                  )}
                </div>

                {/* 1. Thẻ Doanh nghiệp cố định theo Workspace */}
                {selectedCompany && (
                  <div className="">
                    <div className="flex items-start gap-3">
                      <CompanyLogo
                        logoUrl={selectedCompany.logoUrl}
                        name={selectedCompany.name}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-text-main">
                          {selectedCompany.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-text-muted">
                          MST: {selectedCompany.taxCode}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                          {selectedCompany.address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cảnh báo nếu công ty chưa Verified */}
                {!isCompanyVerified && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900">
                    <p className="font-semibold text-amber-800">
                      ⚠️ Doanh nghiệp chưa được xác thực
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-amber-700">
                      Hồ sơ doanh nghiệp đang ở trạng thái{" "}
                      <strong>{selectedCompany?.verificationStatus}</strong>.
                      Quản trị viên cần duyệt hồ sơ trước khi bạn có thể đăng
                      tin tuyển dụng.
                    </p>
                  </div>
                )}

                <FieldError message={fieldErrors.companyId} />

                {/* 2. Vị trí làm việc (LocationSelector) */}
                <div className="border-t border-border pt-4">
                  <LocationSelector
                    provinceId={formData.provinceId}
                    wardId={formData.wardId}
                    detailedLocation={formData.detailedLocation}
                    onChangeProvince={handleProvinceChange}
                    onChangeWard={handleWardChange}
                    onChangeDetailedLocation={handleDetailedLocationChange}
                    errors={{
                      provinceId: fieldErrors.provinceId,
                      wardId: fieldErrors.wardId,
                    }}
                  />
                </div>

                {/* 3. Môi trường làm việc */}
                <div className="border-t border-border pt-4">
                  <BadgeSelector
                    label="Môi trường làm việc"
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
                    <span>Hạn nhận hồ sơ</span>
                    <span className="text-status-error">*</span>
                  </label>
                  <DatePicker
                    id="deadline"
                    name="deadline"
                    minDate={dayjs().format("YYYY-MM-DD")}
                    value={formData.deadline}
                    onChange={handleDeadlineChange}
                    error={Boolean(fieldErrors.deadline)}
                    placeholder="Chọn hạn nhận hồ sơ"
                  />
                  <FieldError message={fieldErrors.deadline} />
                </div>

                  {/* Nút hành động */}
                  {(() => {
                    const totalWeights =
                      formData.matchingWeights.skill +
                      formData.matchingWeights.experience +
                      formData.matchingWeights.title +
                      formData.matchingWeights.other;
                    const isWeightsInvalid = Math.abs(totalWeights - 100) > 0.1;

                    return (
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
                          disabled={
                            !selectedCompany ||
                            !isCompanyVerified ||
                            isWeightsInvalid ||
                            isSubmitting
                          }
                          title={
                            isWeightsInvalid
                              ? `Tổng trọng số đánh giá hiện tại là ${totalWeights}%. Phải đạt chính xác 100% để đăng tin tuyển dụng.`
                              : undefined
                          }
                          className="px-6! py-2! text-xs! font-semibold!"
                        >
                          <span>Đăng tin tuyển dụng</span>
                        </Button>
                      </div>
                    );
                  })()}
              </div>
            </div>
          </div>
        </form>
      )}
    </main>
  );
}
