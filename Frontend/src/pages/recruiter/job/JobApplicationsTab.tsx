import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
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

export const UPDATE_STATUS_OPTIONS: {
  value: UpdateJobApplicationStatus;
  label: string;
}[] = [
  { value: "REVIEWING", label: "Đang xem xét (Reviewing)" },
  { value: "SHORTLISTED", label: "Đã chọn lọc (Shortlisted)" },
  { value: "INTERVIEW", label: "Mời phỏng vấn (Interviewing)" },
  { value: "OFFERED", label: "Mời nhận việc (Offered)" },
  { value: "HIRED", label: "Tuyển dụng thành công (Hired)" },
  { value: "REJECTED", label: "Từ chối (Rejected)" },
  { value: "WITHDRAWN", label: "Rút hồ sơ (Withdrawn)" },
];

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
  ) => Promise<void>;
  isUpdatingStatus?: boolean;
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

  // Filtered applications (Purely computed in useMemo)
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Status filter
      if (statusFilter !== "ALL") {
        const s = (app.status || "").toUpperCase();
        if (statusFilter === "SUBMITTED" && s !== "SUBMITTED" && s !== "APPLIED") {
          return false;
        }
        if (statusFilter !== "SUBMITTED" && s !== statusFilter) {
          return false;
        }
      }

      // Search keyword (candidate name, email, cover letter)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (app.candidateName || "").toLowerCase().includes(q);
        const emailMatch = (app.candidateEmail || "").toLowerCase().includes(q);
        const letterMatch = (app.coverLetter || "").toLowerCase().includes(q);
        const idMatch = app.candidateId.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !letterMatch && !idMatch) {
          return false;
        }
      }

      return true;
    });
  }, [applications, statusFilter, searchQuery]);

  // Status counters
  const reviewingCount = applications.filter(
    (a) => (a.status || "").toUpperCase() === "REVIEWING",
  ).length;
  const interviewCount = applications.filter(
    (a) => (a.status || "").toUpperCase() === "INTERVIEW",
  ).length;
  const acceptedCount = applications.filter(
    (a) => (a.status || "").toUpperCase() === "ACCEPTED",
  ).length;

  const columns = useMemo(
    () =>
      columnHelper.columns([
        // Cột 1: Thông tin ứng viên
        columnHelper.accessor((row) => row.candidateName || row.candidateId, {
          id: "candidateInfo",
          header: "Ứng viên",
          cell: ({ row }) => {
            const app = row.original;
            const displayName =
              app.candidateName || `Ứng viên #${app.candidateId.slice(0, 8)}`;

            return (
              <div className="flex max-w-64 min-w-44 items-center gap-3">
                {app.candidateAvatarUrl ? (
                  <img
                    src={app.candidateAvatarUrl}
                    alt={displayName}
                    className="size-10 shrink-0 rounded-full border border-slate-100 object-cover"
                  />
                ) : (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-primary/10 text-xs font-bold text-primary">
                    <User className="size-4" />
                  </div>
                )}

                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-bold text-slate-800">
                    {displayName}
                  </span>
                  <span className="flex items-center gap-1 truncate text-xs text-slate-500">
                    <Mail className="size-3" />
                    {app.candidateEmail || "Chưa cập nhật email"}
                  </span>
                </div>
              </div>
            );
          },
        }),

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

        // Cột 6: Thao tác duyệt hồ sơ (Duyệt / Chuyển trạng thái)
        columnHelper.display({
          id: "changeStatusAction",
          header: () => <div className="text-center">Cập nhật trạng thái</div>,
          cell: ({ row }) => {
            const app = row.original;
            const currentStatus = (app.status || "SUBMITTED").toUpperCase();

            return (
              <div className="flex justify-center">
                <Select.Root
                  items={UPDATE_STATUS_OPTIONS}
                  value={currentStatus}
                  onValueChange={(val) => {
                    if (val && val !== currentStatus) {
                      onUpdateStatus(app.id, val as UpdateJobApplicationStatus);
                    }
                  }}
                  disabled={isUpdatingStatus}
                >
                  <Select.Trigger
                    aria-label="Cập nhật trạng thái ứng viên"
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary focus:outline-none"
                  >
                    <Select.Value />
                    <Select.Icon className="text-slate-400 transition-transform duration-200 group-data-popup-open:rotate-180">
                      <ChevronDown className="size-3" />
                    </Select.Icon>
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
                      <Select.Popup className="z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-md">
                        <Select.List>
                          {UPDATE_STATUS_OPTIONS.map((opt) => (
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
            );
          },
        }),
      ]),
    [isUpdatingStatus, onUpdateStatus],
  );

  return (
    <div className="space-y-4">
      {/* 1. Quick Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-text-muted">Tổng hồ sơ</span>
          <p className="mt-1 text-xl font-bold text-slate-800">{applications.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-text-muted">Đang xem xét</span>
          <p className="mt-1 text-xl font-bold text-slate-800">{reviewingCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-text-muted">Mời phỏng vấn</span>
          <p className="mt-1 text-xl font-bold text-slate-800">{interviewCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-text-muted">Đã trúng tuyển</span>
          <p className="mt-1 text-xl font-bold text-slate-800">{acceptedCount}</p>
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
                <Select.Popup className="z-50 min-w-40 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-md">
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
                    {selectedLetterApp.candidateName || `Ứng viên #${selectedLetterApp.candidateId.slice(0, 8)}`}
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
                Nộp lúc: {dayjs(selectedLetterApp.appliedAt).format("DD/MM/YYYY HH:mm")}
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
    </div>
  );
}
