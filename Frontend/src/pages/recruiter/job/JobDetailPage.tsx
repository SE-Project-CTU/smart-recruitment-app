import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  MoreVertical,
  Pencil,
  PowerOff,
  Users,
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
import { useProvinces } from "@/hooks/queries/useCatalog";
import { useCompanyDetail, useMyCompanies } from "@/hooks/queries/useCompany";
import {
  useJobApplications,
  useJobPostingDetail,
  useUpdateApplicationStatus,
  useUpdateJobPostingStatus,
} from "@/hooks/queries/useJob";
import type {
  JobApplicationStatus,
} from "@/types/job";
import { formatSalaryRange, getJobTypeLabel, getWorkModeLabel } from "@/utils/jobHelpers";
import { JOB_STATUS_CONFIG } from "./JobPostingsTable";
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
  const { data: company } = useCompanyDetail(job?.companyId);
  const { data: myCompanies = [], isLoading: isLoadingCompanies } = useMyCompanies();

  // Kiểm tra quyền: Tin tuyển dụng có thuộc công ty của Recruiter hay không
  const isMyCompany = useMemo(() => {
    if (!job?.companyId || myCompanies.length === 0) return false;
    return myCompanies.some((c) => c.id === job.companyId);
  }, [job?.companyId, myCompanies]);

  const { data: appsResponse, isLoading: isLoadingApps } = useJobApplications(
    id,
    undefined,
    { enabled: Boolean(id) && isMyCompany }
  );
  const { data: provinces = [] } = useProvinces();

  // 2. Mutations
  const updateJobStatusMutation = useUpdateJobPostingStatus();
  const updateAppStatusMutation = useUpdateApplicationStatus(id);

  // 3. Province name resolver
  const provinceMap = useMemo(() => {
    const map = new Map<string, string>();
    provinces.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [provinces]);

  const applications = useMemo(() => {
    return appsResponse?.items || [];
  }, [appsResponse]);

  // Handlers
  const handleUpdateApplicationStatus = async (
    applicationId: string,
    status: JobApplicationStatus,
  ) => {
    await updateAppStatusMutation.mutateAsync({
      applicationId,
      status,
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
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-44 animate-pulse rounded-2xl border border-border bg-slate-50/70" />
        <div className="h-96 animate-pulse rounded-2xl border border-border bg-slate-50/70" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-2xs">
        <h2 className="text-lg font-bold text-slate-800">
          Không tìm thấy tin tuyển dụng
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Tin tuyển dụng không tồn tại hoặc bạn không có quyền truy cập vào tin này.
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

  const statusConfig = JOB_STATUS_CONFIG[job.status] || {
    label: job.status,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const salaryDisplay = job.salaryNegotiable
    ? "Thỏa thuận"
    : formatSalaryRange(job.salaryMin, job.salaryMax, false);

  const provinceName =
    provinceMap.get(job.provinceId) || job.province?.name || "Toàn quốc";

  const compName =
    company?.name || job.company?.name || job.companyName || "Doanh nghiệp";

  const compLogo =
    company?.logoUrl || job.company?.logoUrl || job.companyLogoUrl || null;

  return (
    <div className="min-h-full space-y-6">
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
      <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Logo & Tiêu đề JD */}
          <div className="flex items-start gap-4">
            <CompanyLogo logoUrl={compLogo} name={compName} size="md" />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {job.title}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.badgeClass}`}
                >
                  {statusConfig.label}
                </span>
              </div>

              <p className="mt-1 text-sm font-medium text-slate-600">
                {compName}
              </p>

              {/* Meta Chips: Thông tin cốt lõi (Ngày tạo, Hạn nộp, Địa điểm, Lương, Hình thức) */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-slate-400" />
                  <span>Ngày đăng: {job.createdAt ? dayjs(job.createdAt).format("DD/MM/YYYY") : "—"}</span>
                </span>

                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-slate-400" />
                  <span>Hạn nhận: {job.deadline ? dayjs(job.deadline).format("DD/MM/YYYY") : "Không thời hạn"}</span>
                </span>

                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-slate-400" />
                  <span>{provinceName}</span>
                </span>

                <span className="flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-slate-400" />
                  <span>{getWorkModeLabel(job.workMode)} • {getJobTypeLabel(job.jobType)}</span>
                </span>

                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <DollarSign className="size-3.5 text-slate-400" />
                  <span>{salaryDisplay}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Nút 3 chấm (More Actions) hoặc Badge Chế độ chỉ xem */}
          <div className="flex items-center self-end sm:self-start">
            {isLoadingCompanies ? null : !isMyCompany ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <AlertTriangle className="size-3.5" />
                <span>Chỉ xem (Công ty khác)</span>
              </span>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex size-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none"
                  aria-label="Tùy chọn thao tác"
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="min-w-48 rounded-xl border border-border p-1 shadow-md">
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
                        ? "opacity-50 pointer-events-none text-slate-400"
                        : "text-rose-600 hover:bg-rose-50"
                    }`}
                  >
                    <PowerOff className="size-3.5" />
                    <span>{isClosed ? "Tin đã đóng" : "Đóng tin tuyển dụng (Ẩn)"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors ${
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
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors ${
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
        <JobDetailInfoTab
          job={job}
          company={company}
          provinceName={provinceName}
        />
      ) : !isMyCompany ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">
            Quyền truy cập bị giới hạn
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500">
            Bạn không thuộc công ty sở hữu tin tuyển dụng này nên không có quyền xem và xử lý danh sách ứng viên (JOB_POSTING_FORBIDDEN).
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
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3 text-rose-600">
              <div className="flex size-11 items-center justify-center rounded-xl bg-rose-50">
                <AlertTriangle className="size-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xác nhận đóng tin tuyển dụng
                </h3>
                <p className="text-xs text-slate-500">
                  Thao tác này sẽ ẩn tin và dừng nhận hồ sơ ứng tuyển
                </p>
              </div>
            </div>

            {isClosingSuccess ? (
              <div className="my-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
                ✓ Đã đóng tin tuyển dụng thành công!
              </div>
            ) : (
              <p className="my-3 text-xs leading-relaxed text-slate-600">
                Bạn có chắc chắn muốn đóng nhận hồ sơ cho tin{" "}
                <strong className="font-semibold text-slate-900">"{job.title}"</strong>?
                Sau khi đóng, ứng viên sẽ không thể gửi hồ sơ ứng tuyển vào vị trí này nữa.
              </p>
            )}

            {!isClosingSuccess && (
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <Button
                  variant="secondary"
                  disabled={updateJobStatusMutation.isPending}
                  onClick={() => setIsClosingModalOpen(false)}
                  className="px-4! py-2! text-xs! font-medium!"
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="primary"
                  isLoading={updateJobStatusMutation.isPending}
                  onClick={handleExecuteCloseJob}
                  className="bg-rose-600! px-4! py-2! text-xs! font-semibold! hover:bg-rose-700!"
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
