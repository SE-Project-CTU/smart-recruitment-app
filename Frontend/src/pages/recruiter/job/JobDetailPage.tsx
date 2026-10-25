import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  MapPin,
  MoreVertical,
  Pencil,
  PowerOff,
  Users,
  Award,
  Briefcase,
  Laptop,
} from "lucide-react";
import dayjs from "dayjs";
import Button from "@/components/Button";
import { PATHS } from "@/constants/paths";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMyCompanies } from "@/hooks/queries/useCompany";
import {
  useJobApplications,
  useJobPostingDetail,
  useUpdateApplicationStatus,
  useUpdateJobPostingStatus,
} from "@/hooks/queries/useJob";
import type { JobApplicationStatus } from "@/types/job";
import {
  formatSalaryRange,
  getJobLevelLabel,
  getWorkModeLabel,
} from "@/utils/jobHelpers";
import { JOB_STATUS_CONFIG } from "@/types/job";
import { JobDetailInfoTab } from "./JobDetailInfoTab";
import { JobApplicationsTab } from "./JobApplicationsTab";

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Active tab state: "info" | "applications"
  const [activeTab, setActiveTab] = useState<"info" | "applications">("info");

  // Close job confirm modal state
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [isClosingSuccess, setIsClosingSuccess] = useState(false);

  // 1. Real Queries
  const { data: job, isLoading: isLoadingJob } = useJobPostingDetail(id);
  const { data: myCompanies = [], isLoading: isLoadingCompanies } =
    useMyCompanies();

  const isMyCompany = useMemo(() => {
    const targetCompanyId = job?.companyId || job?.company?.id;
    if (!targetCompanyId || myCompanies.length === 0) return false;
    return myCompanies.some((c) => c.id === targetCompanyId);
  }, [job, myCompanies]);

  const { data: appsResponse, isLoading: isLoadingApps } = useJobApplications(
    id,
    undefined,
    { enabled: Boolean(id) && isMyCompany },
  );

  // 2. Mutations
  const updateJobStatusMutation = useUpdateJobPostingStatus();
  const updateAppStatusMutation = useUpdateApplicationStatus(id);

  // 3. Province name resolver

  const applications = useMemo(() => {
    return appsResponse?.items || [];
  }, [appsResponse]);

  // Handlers
  const handleUpdateApplicationStatus = async (
    applicationId: string,
    status: JobApplicationStatus | string,
    note?: string,
  ) => {
    await updateAppStatusMutation.mutateAsync({
      applicationId,
      status,
      note,
    });
  };

  const handleExecuteCloseJob = async () => {
    if (!job) return;
    try {
      await updateJobStatusMutation.mutateAsync({
        jobId: job.id,
        status: "CLOSED",
      });
      setIsClosingSuccess(true);
      setTimeout(() => {
        setIsClosingModalOpen(false);
        setIsClosingSuccess(false);
      }, 1200);
    } catch {
      // Handled by react query
    }
  };

  if (isLoadingJob) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-44 animate-pulse rounded-2xl border border-border bg-slate-50/70" />
        <div className="h-96 animate-pulse rounded-2xl border border-border bg-slate-50/70" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-2xs sm:p-12">
        <h2 className="text-base font-bold text-slate-800 sm:text-lg">
          Không tìm thấy tin tuyển dụng
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Tin tuyển dụng không tồn tại hoặc bạn không có quyền truy cập vào tin
          này.
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
    );
  }

  const isClosed =
    job.status?.toUpperCase() === "CLOSED" ||
    job.status?.toUpperCase() === "EXPIRED";

  const rawStatus = job.status || "Draft";
  const statusConfig = JOB_STATUS_CONFIG[rawStatus] ||
    JOB_STATUS_CONFIG[rawStatus.toUpperCase()] || {
      label: rawStatus,
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    };

  const salaryDisplay = job.salaryNegotiable
    ? "Thỏa thuận"
    : formatSalaryRange(job.salaryMin, job.salaryMax, false);

  const provinceName = job.province?.name;

  const compName = job.company?.name || "Doanh nghiệp";
  const compLogo = job.company?.logoUrl || null;

  return (
    <div className="min-h-full space-y-4 sm:space-y-6">
      {/* 1. Nút Back */}
      <div>
        <Button
          variant="secondary"
          icon={ArrowLeft}
          iconSize={15}
          onClick={() => navigate(PATHS.RECRUITER.JOBS)}
          className="h-8! px-3! text-xs! font-medium!"
        >
          Quay lại danh sách JD
        </Button>
      </div>

      {/* 2. Header Banner Tin Tuyển Dụng */}
      <div className="relative rounded-2xl border border-border bg-white p-4 sm:rounded-3xl sm:p-6 lg:p-7">
        {/* Nút 3 chấm (More Actions) - Đặt Absolute góc phải trên cùng */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-7 lg:right-7">
          {isLoadingCompanies ? null : !isMyCompany ? (
            <span className="hidden items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 sm:inline-flex">
              <AlertTriangle className="size-3.5" />
              <span>Chỉ xem</span>
            </span>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-xl border border-border bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 focus:outline-none sm:size-9"
                aria-label="Tùy chọn thao tác"
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="min-w-40 rounded-xl border border-border p-1 shadow-md sm:min-w-48"
              >
                <DropdownMenuItem
                  onClick={() =>
                    navigate(PATHS.RECRUITER.EDIT_JOB.replace(":id", job.id))
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Pencil className="size-3.5 text-slate-500" />
                  <span>Chỉnh sửa tin</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled={isClosed}
                  onClick={() => setIsClosingModalOpen(true)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium ${
                    isClosed
                      ? "pointer-events-none text-slate-400 opacity-50"
                      : "text-rose-600 hover:bg-rose-50"
                  }`}
                >
                  <PowerOff className="size-3.5" />
                  <span>
                    {isClosed ? "Tin đã đóng" : "Đóng tin tuyển dụng"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Layout 2 cột trên Desktop (lg) */}
        <div className="flex flex-col gap-6 lg:items-start lg:pr-14 2xl:flex-row">
          {/* Cột trái: Logo & Thông tin */}
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-5">
            <div className="shrink-0">
              <CompanyLogo logoUrl={compLogo} name={compName} size="md" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5 sm:gap-2">
              {/* Tiêu đề & Trạng thái */}
              <div className="flex flex-wrap items-center gap-2 pr-8 sm:gap-2.5 sm:pr-10 lg:pr-0">
                <h1 className="text-xl leading-tight font-bold tracking-tight text-text-main sm:text-2xl">
                  {job.title}
                </h1>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:text-xs ${statusConfig.badgeClass}`}
                >
                  {statusConfig.label}
                </span>
              </div>

              {/* Tên công ty có icon trỏ ra chi tiết */}
              <div className="flex items-center">
                {job.companyId || job.company?.id ? (
                  <Link
                    to={`/recruiter/company-management/${job.companyId || job.company?.id}/overview`}
                    className="group inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-primary sm:gap-1.5 sm:text-sm"
                  >
                    <span className="truncate">{compName}</span>
                    <ExternalLink className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <span className="truncate text-xs font-semibold text-slate-500 sm:text-sm">
                    {compName}
                  </span>
                )}
                {job.creator && (
                  <div className="flex items-center gap-1.5 pl-1 text-text-muted before:text-slate-300 before:content-['•']">
                    <span className="text-[11px]">Đăng bởi</span>
                    {job.creator.avatarUrl ? (
                      <img
                        src={job.creator.avatarUrl}
                        alt={job.creator.fullName}
                        loading="lazy"
                        className="size-4.5 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <div className="flex size-4.5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                        {job.creator.fullName
                          ? job.creator.fullName.slice(0, 1).toUpperCase()
                          : "U"}
                      </div>
                    )}
                    <span className="text-xs font-medium text-text-main">
                      {job.creator.fullName || "Nhà tuyển dụng"}
                    </span>
                    {job.creator.email && (
                      <span className="text-[11px] text-text-muted">
                        ({job.creator.email})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Danh sách Skill Badges */}
              {job.skills && job.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {job.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-[10px] font-medium text-sky-700 capitalize select-none sm:text-[11px]"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:mt-0">
            {/* 1. Mức lương */}
            <div className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-white-blue text-secondary-dark">
                <DollarSign className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-medium text-slate-500 sm:text-[11px]">
                  Mức lương
                </span>
                <span className="block truncate text-xs font-bold text-slate-800 sm:text-sm">
                  {salaryDisplay}
                </span>
              </div>
            </div>

            {/* 2. Cấp bậc */}
            <div className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-white-blue text-secondary-dark">
                <Award className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-medium text-slate-500 sm:text-[11px]">
                  Cấp bậc
                </span>
                <span className="block truncate text-xs font-bold text-slate-800 sm:text-sm">
                  {getJobLevelLabel(job.jobLevel)}
                </span>
              </div>
            </div>

            {/* 3. Hạn nhận hồ sơ */}
            <div className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-white-blue text-secondary-dark">
                <Clock className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-medium text-slate-500 sm:text-[11px]">
                  Hạn nhận hồ sơ
                </span>
                <span className="block truncate text-xs font-bold text-slate-800 sm:text-sm">
                  {job.deadline
                    ? dayjs(job.deadline).format("DD/MM/YYYY")
                    : "Không thời hạn"}
                </span>
              </div>
            </div>

            {/* 4. Kinh nghiệm */}
            <div className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-white-blue text-secondary-dark">
                <Briefcase className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-medium text-slate-500 sm:text-[11px]">
                  Kinh nghiệm
                </span>
                <span className="block truncate text-xs font-bold text-slate-800 sm:text-sm">
                  {job.experienceYears
                    ? `${job.experienceYears} năm`
                    : "Không yêu cầu"}
                </span>
              </div>
            </div>

            {/* 5. Khu vực */}
            <div className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-white-blue text-secondary-dark">
                <MapPin className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-medium text-slate-500 sm:text-[11px]">
                  Khu vực
                </span>
                <span className="block truncate text-xs font-bold text-slate-800 sm:text-sm">
                  {provinceName}
                </span>
              </div>
            </div>

            {/* 6. Hình thức làm việc */}
            <div className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-white-blue text-secondary-dark">
                <Laptop className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-medium text-slate-500 sm:text-[11px]">
                  Hình thức làm việc
                </span>
                <span className="block truncate text-xs font-bold text-slate-800 sm:text-sm">
                  {getWorkModeLabel(job.workMode)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar (Scrollable on Mobile) */}
      <div className="no-scrollbar flex overflow-x-auto border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors sm:px-5 ${
            activeTab === "info"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="size-4" />
          <span>Thông tin JD</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("applications")}
          className={`flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors sm:px-5 ${
            activeTab === "applications"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="size-4" />
          <span>Đơn ứng tuyển</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === "applications"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {isMyCompany ? applications.length : "—"}
          </span>
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === "info" ? (
        <JobDetailInfoTab job={job} provinceName={provinceName} />
      ) : !isMyCompany ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-2xs sm:p-12">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-800 sm:text-base">
            Quyền truy cập bị giới hạn
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500">
            Bạn không thuộc công ty sở hữu tin tuyển dụng này nên không có quyền
            xem và xử lý danh sách ứng viên.
          </p>
        </div>
      ) : (
        <JobApplicationsTab
          applications={applications}
          isLoading={isLoadingApps}
          onUpdateStatus={handleUpdateApplicationStatus}
          isUpdatingStatus={updateAppStatusMutation.isPending}
        />
      )}

      {/* 5. Modal Xác nhận Đóng tin */}
      {isClosingModalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-xl sm:rounded-3xl sm:p-6">
            <div className="mb-4 flex items-center gap-3 text-rose-600">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 sm:size-11">
                <AlertTriangle className="size-5 text-rose-600 sm:size-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                  Xác nhận đóng tin tuyển dụng
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                  Thao tác này sẽ ẩn tin và dừng nhận hồ sơ
                </p>
              </div>
            </div>

            {isClosingSuccess ? (
              <div className="my-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
                ✓ Đã đóng tin tuyển dụng thành công!
              </div>
            ) : (
              <p className="my-3 text-xs leading-relaxed text-slate-600 sm:my-4">
                Bạn có chắc chắn muốn đóng nhận hồ sơ cho tin{" "}
                <strong className="font-semibold text-slate-900">
                  "{job.title}"
                </strong>
                ? Sau khi đóng, ứng viên sẽ không thể gửi hồ sơ vào vị trí này
                nữa.
              </p>
            )}

            {!isClosingSuccess && (
              <div className="mt-5 flex flex-col-reverse items-center justify-end gap-2.5 sm:mt-6 sm:flex-row sm:gap-3">
                <Button
                  variant="secondary"
                  disabled={updateJobStatusMutation.isPending}
                  onClick={() => setIsClosingModalOpen(false)}
                  className="w-full px-4! py-2! text-xs! font-medium! sm:w-auto"
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="primary"
                  isLoading={updateJobStatusMutation.isPending}
                  onClick={handleExecuteCloseJob}
                  className="w-full bg-rose-600! px-4! py-2! text-xs! font-semibold! hover:bg-rose-700! sm:w-auto"
                >
                  Xác nhận đóng tin
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
