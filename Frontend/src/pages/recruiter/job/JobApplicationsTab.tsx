import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileText,
  Filter,
  Mail,
  MessageSquare,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import Button from "@/components/Button";
import { DataTable, type DataTableFeatures } from "@/components/DataTable";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import type {
  JobApplicationItem,
  JobApplicationStatus,
  UpdateJobApplicationStatus,
} from "@/types/job";

const columnHelper =
  createColumnHelper<DataTableFeatures, JobApplicationItem>();

/**
 * Thông tin ứng viên sau khi resolve từ dữ liệu thực tế
 */
export interface CandidateResolvedProfile {
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}

/**
 * Resolver lấy thông tin Tên, Email, Avatar của ứng viên từ API backend
 */
export function resolveCandidateProfile(
  app: JobApplicationItem,
): CandidateResolvedProfile {
  // 1. Lấy trực tiếp từ object candidate (backend mới: { id, fullName, email, avatarUrl })
  const name =
    app.candidate?.fullName ||
    app.candidateName ||
    "Ứng viên";

  const email =
    app.candidate?.email ||
    app.candidateEmail ||
    "Chưa cập nhật email";

  const avatarUrl =
    app.candidate?.avatarUrl ||
    app.candidateAvatarUrl ||
    null;

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0].toUpperCase())
      .join("") || "UV";

  return {
    name,
    email,
    avatarUrl,
    initials,
  };
}

export const APPLICATION_STATUS_OPTIONS: {
  value: JobApplicationStatus | "ALL";
  label: string;
}[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "SUBMITTED", label: "Đã nộp hồ sơ (Submitted)" },
  { value: "REVIEWING", label: "Đang xem xét (Reviewing)" },
  { value: "SHORTLISTED", label: "Đã chọn lọc (Shortlisted)" },
  { value: "INTERVIEW", label: "Mời phỏng vấn (Interviewing)" },
  { value: "OFFERED", label: "Mời nhận việc (Offered)" },
  { value: "HIRED", label: "Đã tuyển dụng (Hired)" },
  { value: "REJECTED", label: "Từ chối (Rejected)" },
  { value: "WITHDRAWN", label: "Rút hồ sơ (Withdrawn)" },
];

/**
 * Ma trận chuyển đổi trạng thái hợp lệ của HR (State Transition Matrix)
 * Tuân thủ chính xác theo logic SmartHire.Domain.Entities.JobApplication.TryChangeStatus
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<
  string,
  { value: UpdateJobApplicationStatus; label: string }[]
> = {
  SUBMITTED: [
    { value: "REVIEWING", label: "Đang xem xét (Reviewing)" },
  ],
  REVIEWING: [
    { value: "SHORTLISTED", label: "Vào danh sách chọn lọc (Shortlisted)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  SHORTLISTED: [
    { value: "INTERVIEW", label: "Mời phỏng vấn (Interviewing)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  INTERVIEW: [
    { value: "OFFERED", label: "Gửi đề nghị việc làm (Offered)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  INTERVIEWING: [
    { value: "OFFERED", label: "Gửi đề nghị việc làm (Offered)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  OFFERED: [
    { value: "HIRED", label: "Tuyển dụng thành công (Hired)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  RECEIVED: [
    { value: "SHORTLISTED", label: "Vào danh sách chọn lọc (Shortlisted)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  APPROVED: [
    { value: "INTERVIEW", label: "Mời phỏng vấn (Interviewing)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  // Terminal states: Kết thúc quy trình, không được phép chuyển tiếp nữa
  HIRED: [],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export const APPLICATION_STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  SUBMITTED: {
    label: "Đã nộp",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  RECEIVED: {
    label: "Đã tiếp nhận",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  APPLIED: {
    label: "Đã nộp",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  REVIEWING: {
    label: "Đang xem xét",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  SHORTLISTED: {
    label: "Đã chọn lọc",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  INTERVIEW: {
    label: "Phỏng vấn",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  INTERVIEWING: {
    label: "Phỏng vấn",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  OFFERED: {
    label: "Mời nhận việc",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  HIRED: {
    label: "Đã tuyển dụng",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  ACCEPTED: {
    label: "Đã tuyển dụng",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Từ chối",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  WITHDRAWN: {
    label: "Đã rút hồ sơ",
    badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
};

interface JobApplicationsTabProps {
  applications: JobApplicationItem[];
  isLoading?: boolean;
  onUpdateStatus: (
    applicationId: string,
    status: UpdateJobApplicationStatus | JobApplicationStatus,
    note?: string,
  ) => Promise<void>;
  isUpdatingStatus?: boolean;
}

interface PendingStatusChange {
  app: JobApplicationItem;
  fromStatus: string;
  toStatus: UpdateJobApplicationStatus;
}

export function JobApplicationsTab({
  applications,
  isLoading,
  onUpdateStatus,
  isUpdatingStatus,
}: JobApplicationsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedLetterApp, setSelectedLetterApp] =
    useState<JobApplicationItem | null>(null);

  // State cho Modal xác nhận chuyển trạng thái
  const [pendingChange, setPendingChange] = useState<PendingStatusChange | null>(
    null,
  );
  const [transitionNote, setTransitionNote] = useState("");
  const [isSubmittingTransition, setIsSubmittingTransition] = useState(false);

  // Filtered applications (Tính toán qua useMemo kết hợp resolve thông tin)
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // 1. Lọc theo trạng thái
      if (statusFilter !== "ALL") {
        const s = (app.status || "").toUpperCase();
        if (
          statusFilter === "SUBMITTED" &&
          s !== "SUBMITTED" &&
          s !== "APPLIED" &&
          s !== "RECEIVED"
        ) {
          return false;
        }
        if (
          statusFilter === "INTERVIEW" &&
          s !== "INTERVIEW" &&
          s !== "INTERVIEWING"
        ) {
          return false;
        }
        if (
          statusFilter === "HIRED" &&
          s !== "HIRED" &&
          s !== "ACCEPTED"
        ) {
          return false;
        }
        if (
          statusFilter !== "SUBMITTED" &&
          statusFilter !== "INTERVIEW" &&
          statusFilter !== "HIRED" &&
          s !== statusFilter
        ) {
          return false;
        }
      }

      // 2. Tìm kiếm theo Tên, Email hoặc Nội dung thư
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const profile = resolveCandidateProfile(app);
        const nameMatch = profile.name.toLowerCase().includes(q);
        const emailMatch = profile.email.toLowerCase().includes(q);
        const letterMatch = (app.coverLetter || "").toLowerCase().includes(q);
        const candidateId = app.candidate?.id || app.candidateId || "";
        const idMatch = candidateId.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !letterMatch && !idMatch) {
          return false;
        }
      }

      return true;
    });
  }, [applications, statusFilter, searchQuery]);

  // Quick stat counters
  const reviewingCount = applications.filter(
    (a) => (a.status || "").toUpperCase() === "REVIEWING",
  ).length;
  const interviewCount = applications.filter((a) => {
    const s = (a.status || "").toUpperCase();
    return s === "INTERVIEW" || s === "INTERVIEWING";
  }).length;
  const acceptedCount = applications.filter((a) => {
    const s = (a.status || "").toUpperCase();
    return s === "HIRED" || s === "ACCEPTED";
  }).length;

  const handleOpenConfirmTransition = (
    app: JobApplicationItem,
    targetStatus: UpdateJobApplicationStatus,
  ) => {
    const currentStatus = (app.status || "SUBMITTED").toUpperCase();
    setPendingChange({
      app,
      fromStatus: currentStatus,
      toStatus: targetStatus,
    });
    setTransitionNote("");
  };

  const handleConfirmTransition = async () => {
    if (!pendingChange) return;
    setIsSubmittingTransition(true);
    try {
      await onUpdateStatus(
        pendingChange.app.id,
        pendingChange.toStatus,
        transitionNote,
      );
      setPendingChange(null);
      setTransitionNote("");
    } catch {
      // Đã được xử lý bởi query toast
    } finally {
      setIsSubmittingTransition(false);
    }
  };

  const columns = useMemo(
    () =>
      columnHelper.columns([
        // Cột 1: Thông tin ứng viên (Đầy đủ Tên, Email, Avatar)
        columnHelper.accessor(
          (row) => {
            const p = resolveCandidateProfile(row);
            return p.name;
          },
          {
            id: "candidateInfo",
            header: "Ứng viên",
            cell: ({ row }) => {
              const app = row.original;
              const profile = resolveCandidateProfile(app);

              return (
                <div className="flex max-w-64 min-w-44 items-center gap-3">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="size-10 shrink-0 rounded-full border border-slate-200 object-cover bg-slate-100"
                      onError={(e) => {
                        // Fallback nếu ảnh không load được
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary border border-primary/20">
                      {profile.initials}
                    </div>
                  )}

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-bold text-slate-800">
                      {profile.name}
                    </span>
                    <span className="flex items-center gap-1 truncate text-xs text-slate-500">
                      <Mail className="size-3 shrink-0 text-slate-400" />
                      <span className="truncate">{profile.email}</span>
                    </span>
                  </div>
                </div>
              );
            },
          },
        ),

        // Cột 2: Hồ sơ đính kèm (CV)
        columnHelper.display({
          id: "cvDocument",
          header: "Hồ sơ đính kèm",
          cell: ({ row }) => {
            const app = row.original;

            return (
              <div className="flex items-center gap-2">
                {app.uploadedCvUrl ? (
                  <a
                    href={app.uploadedCvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    <FileText className="size-3.5 text-rose-500" />
                    <span>File CV PDF</span>
                    <ExternalLink className="size-3 opacity-60" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                    <Sparkles className="size-3.5 text-primary" />
                    <span>CV Hệ thống</span>
                  </span>
                )}
              </div>
            );
          },
        }),

        // Cột 3: Thư giới thiệu (Cover Letter)
        columnHelper.display({
          id: "coverLetter",
          header: "Thư giới thiệu",
          meta: { className: "hidden md:table-cell" },
          cell: ({ row }) => {
            const app = row.original;
            if (!app.coverLetter) {
              return <span className="text-xs text-slate-400">Không có</span>;
            }

            return (
              <div className="flex items-center gap-1.5 max-w-56">
                <p className="truncate text-xs text-slate-600">
                  {app.coverLetter}
                </p>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        onClick={() => setSelectedLetterApp(app)}
                        className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary cursor-pointer"
                      >
                        <MessageSquare className="size-3.5" />
                      </button>
                    }
                  />
                  <TooltipPanel>Đọc toàn bộ thư giới thiệu</TooltipPanel>
                </Tooltip>
              </div>
            );
          },
        }),

        // Cột 4: Ngày nộp hồ sơ
        columnHelper.accessor("appliedAt", {
          header: "Ngày nộp",
          cell: ({ row }) => {
            const iso = row.original.appliedAt;
            return (
              <span className="text-xs font-medium text-slate-700">
                {iso ? dayjs(iso).format("DD/MM/YYYY HH:mm") : "—"}
              </span>
            );
          },
        }),

        // Cột 5: Trạng thái hiện tại
        columnHelper.accessor("status", {
          header: "Trạng thái",
          cell: ({ row }) => {
            const rawStatus = (row.original.status || "SUBMITTED").toUpperCase();
            const cfg = APPLICATION_STATUS_CONFIG[rawStatus] || {
              label: rawStatus,
              badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
            };

            return (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${cfg.badgeClass}`}
              >
                {cfg.label}
              </span>
            );
          },
        }),

        // Cột 6: Thao tác duyệt hồ sơ theo đúng State Machine
        columnHelper.display({
          id: "changeStatusAction",
          header: () => <div className="text-center">Cập nhật trạng thái</div>,
          cell: ({ row }) => {
            const app = row.original;
            const currentStatus = (app.status || "SUBMITTED").toUpperCase();
            const nextAllowedOptions =
              ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

            // Nếu trạng thái đã là Terminal (HIRED, REJECTED, WITHDRAWN)
            if (nextAllowedOptions.length === 0) {
              const isHired =
                currentStatus === "HIRED" || currentStatus === "ACCEPTED";
              const isRejected = currentStatus === "REJECTED";

              return (
                <div className="flex justify-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                      isHired
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : isRejected
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    <CheckCircle2 className="size-3" />
                    <span>Hoàn tất quy trình</span>
                  </span>
                </div>
              );
            }

            return (
              <div className="flex justify-center">
                <Select.Root
                  items={nextAllowedOptions}
                  onValueChange={(val) => {
                    if (val) {
                      handleOpenConfirmTransition(
                        app,
                        val as UpdateJobApplicationStatus,
                      );
                    }
                  }}
                  disabled={isUpdatingStatus}
                >
                  <Select.Trigger
                    aria-label="Cập nhật trạng thái ứng viên"
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary focus:outline-none"
                  >
                    <span>Chuyển trạng thái...</span>
                    <Select.Icon className="text-slate-400 transition-transform duration-200 group-data-popup-open:rotate-180">
                      <ChevronDown className="size-3" />
                    </Select.Icon>
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
                      <Select.Popup className="z-50 min-w-48 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-md">
                        <Select.List>
                          {nextAllowedOptions.map((opt) => (
                            <Select.Item
                              key={opt.value}
                              value={opt.value}
                              className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-slate-100 ${
                                opt.value === "REJECTED"
                                  ? "text-rose-600 hover:bg-rose-50"
                                  : "text-slate-700 hover:text-primary"
                              }`}
                            >
                              <Select.ItemText>{opt.label}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Popup>
                    </Select.Positioner>
                  </Select.Portal>
                </Select.Root>
              </div>
            );
          },
        }),
      ]),
    [isUpdatingStatus],
  );

  return (
    <div className="space-y-4">
      {/* 1. Quick Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-text-muted">Tổng hồ sơ</span>
          <p className="mt-1 text-xl font-bold text-slate-800">
            {applications.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-text-muted">Đang xem xét</span>
          <p className="mt-1 text-xl font-bold text-sky-700">{reviewingCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-text-muted">Mời phỏng vấn</span>
          <p className="mt-1 text-xl font-bold text-amber-700">
            {interviewCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-text-muted">Đã trúng tuyển</span>
          <p className="mt-1 text-xl font-bold text-emerald-700">
            {acceptedCount}
          </p>
        </div>
      </div>

      {/* 2. Toolbar & Bộ lọc */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        {/* Tìm kiếm ứng viên */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên ứng viên, email hoặc nội dung thư..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-slate-50/50 py-2 pl-9 pr-8 text-xs text-text-main transition-colors placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Lọc theo trạng thái hồ sơ */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 shadow-2xs">
          <Filter className="size-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">Trạng thái:</span>
          <Select.Root
            items={APPLICATION_STATUS_OPTIONS}
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val || "ALL")}
          >
            <Select.Trigger
              aria-label="Lọc hồ sơ theo trạng thái"
              className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <Select.Value />
              <Select.Icon className="text-slate-400 transition-transform duration-200 group-data-popup-open:rotate-180">
                <ChevronDown className="size-3.5" />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
                <Select.Popup className="z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-md">
                  <Select.List>
                    {APPLICATION_STATUS_OPTIONS.map((opt) => (
                      <Select.Item
                        key={opt.value}
                        value={opt.value}
                        className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-100 data-[state=checked]:font-semibold data-[state=checked]:text-primary"
                      >
                        <Select.ItemText>{opt.label}</Select.ItemText>
                        <Select.ItemIndicator animation="pop" className="ml-2 text-xs text-primary">
                          ✓
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      {/* 3. DataTable ứng viên */}
      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-slate-50/50" />
      ) : (
        <DataTable
          columns={columns}
          data={filteredApplications}
          emptyMessage={
            searchQuery || statusFilter !== "ALL"
              ? "Không tìm thấy hồ sơ nào khớp với bộ lọc."
              : "Chưa có ứng viên nào nộp hồ sơ vào tin tuyển dụng này."
          }
        />
      )}

      {/* 4. Modal Đọc toàn bộ Thư giới thiệu (Cover Letter) */}
      {selectedLetterApp && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquare className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Thư giới thiệu của ứng viên
                  </h3>
                  <p className="text-xs text-slate-500">
                    {resolveCandidateProfile(selectedLetterApp).name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLetterApp(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700 sm:text-sm">
                {selectedLetterApp.coverLetter}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Nộp lúc:{" "}
                {dayjs(selectedLetterApp.appliedAt).format("DD/MM/YYYY HH:mm")}
              </span>
              <Button
                variant="secondary"
                onClick={() => setSelectedLetterApp(null)}
                className="px-4! py-1.5! text-xs! font-medium!"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Xác nhận chuyển trạng thái hồ sơ theo State Machine */}
      {pendingChange && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <AlertCircle className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Xác nhận chuyển trạng thái
                  </h3>
                  <p className="text-xs text-slate-500">
                    Quy trình xử lý hồ sơ ứng viên
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmittingTransition}
                onClick={() => setPendingChange(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Thông tin chuyển đổi */}
            <div className="mt-4 space-y-3.5">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ứng viên:</span>
                  <span className="font-bold text-slate-800">
                    {resolveCandidateProfile(pendingChange.app).name}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-600">
                    {resolveCandidateProfile(pendingChange.app).email}
                  </span>
                </div>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-white p-3">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    APPLICATION_STATUS_CONFIG[pendingChange.fromStatus]?.badgeClass ||
                    "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {APPLICATION_STATUS_CONFIG[pendingChange.fromStatus]?.label ||
                    pendingChange.fromStatus}
                </span>

                <ArrowRight className="size-4 text-slate-400" />

                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    APPLICATION_STATUS_CONFIG[pendingChange.toStatus]?.badgeClass ||
                    "bg-primary/10 text-primary border-primary/20"
                  }`}
                >
                  {APPLICATION_STATUS_CONFIG[pendingChange.toStatus]?.label ||
                    pendingChange.toStatus}
                </span>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Ghi chú nội bộ (tùy chọn)
                </label>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Lưu lại lý do hoặc thông tin cho vòng xử lý này (tối đa 2,000 ký tự).
                </p>
                <textarea
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Ví dụ: Đạt yêu cầu CV, hẹn phỏng vấn kỹ thuật vào thứ 5 tuần tới..."
                  className="mt-1.5 w-full rounded-xl border border-border bg-slate-50/50 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <Button
                variant="secondary"
                disabled={isSubmittingTransition}
                onClick={() => setPendingChange(null)}
                className="px-4! py-1.5! text-xs! font-medium!"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                disabled={isSubmittingTransition}
                onClick={handleConfirmTransition}
                className="px-4! py-1.5! text-xs! font-semibold!"
              >
                {isSubmittingTransition ? "Đang cập nhật..." : "Xác nhận chuyển"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
