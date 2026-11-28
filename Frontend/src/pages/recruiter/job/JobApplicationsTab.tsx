import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ChevronDown,
  FileText,
  Filter,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import { Button, DataTable, type DataTableFeatures } from "@/components/common";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_CONFIG,
  APPLICATION_STATUS_OPTIONS,
  getAllowedStatusTransitions,
  normalizeApplicationStatus,
  resolveCandidateProfile,
  type JobApplicationItem,
  type JobApplicationStatus,
  type PendingStatusChange,
  type UpdateJobApplicationStatus,
} from "@/types/application";

const columnHelper = createColumnHelper<
  DataTableFeatures,
  JobApplicationItem
>();

interface JobApplicationsTabProps {
  applications: JobApplicationItem[];
  isLoading?: boolean;
  isJobClosed?: boolean;
  onUpdateStatus: (
    applicationId: string,
    status: UpdateJobApplicationStatus | JobApplicationStatus,
    note?: string,
  ) => Promise<void>;
  isUpdatingStatus?: boolean;
}

export function JobApplicationsTab({
  applications,
  isLoading,
  isJobClosed = false,
  onUpdateStatus,
  isUpdatingStatus,
}: JobApplicationsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedLetterApp, setSelectedLetterApp] =
    useState<JobApplicationItem | null>(null);

  // State cho Modal xác nhận chuyển trạng thái
  const [pendingChange, setPendingChange] =
    useState<PendingStatusChange | null>(null);
  const [transitionNote, setTransitionNote] = useState("");
  const [isSubmittingTransition, setIsSubmittingTransition] = useState(false);

  // Filtered applications (Tính toán qua useMemo kết hợp resolve thông tin)
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // 1. Lọc theo trạng thái
      if (statusFilter !== "ALL") {
        const normApp = normalizeApplicationStatus(app.status);
        const normFilter = normalizeApplicationStatus(statusFilter);
        if (normApp !== normFilter) {
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
    (a) =>
      normalizeApplicationStatus(a.status) === APPLICATION_STATUS.REVIEWING,
  ).length;
  const interviewCount = applications.filter((a) => {
    return (
      normalizeApplicationStatus(a.status) === APPLICATION_STATUS.INTERVIEWING
    );
  }).length;
  const acceptedCount = applications.filter((a) => {
    return normalizeApplicationStatus(a.status) === APPLICATION_STATUS.HIRED;
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
                      className="size-9 shrink-0 rounded-full border border-border bg-bg object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                      {profile.initials}
                    </div>
                  )}

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-xs font-semibold text-text-main sm:text-sm">
                      {profile.name}
                    </span>
                    <span className="truncate text-xs text-text-muted">
                      {profile.email}
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
          header: () => <div className="text-center">Hồ sơ CV</div>,
          cell: ({ row }) => {
            const app = row.original;

            return (
              <div className="flex justify-center">
                {app.uploadedCvUrl ? (
                  <a
                    href={app.uploadedCvUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Mở file CV PDF đã tải lên"
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
                  >
                    <span>Xem CV</span>
                    <FileText className="size-3" />
                  </a>
                ) : (
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-bg px-3 text-xs font-medium text-text-muted">
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
          header: () => <div className="text-center">Thư giới thiệu</div>,
          meta: { className: "hidden md:table-cell" },
          cell: ({ row }) => {
            const app = row.original;
            if (!app.coverLetter || !app.coverLetter.trim()) {
              return (
                <div className="flex justify-center text-xs text-text-muted/60">
                  <span>—</span>
                </div>
              );
            }

            return (
              <div className="flex justify-center">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        onClick={() => setSelectedLetterApp(app)}
                        className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-border bg-white text-text-muted transition-colors hover:border-primary hover:text-primary"
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
              <span className="text-xs font-medium text-text-main">
                {iso ? dayjs(iso).format("DD/MM/YYYY HH:mm") : "—"}
              </span>
            );
          },
        }),

        // Cột 5: Trạng thái hiện tại
        columnHelper.accessor("status", {
          header: "Trạng thái",
          cell: ({ row }) => {
            const normalizedStatus = normalizeApplicationStatus(
              row.original.status,
            );
            const cfg = APPLICATION_STATUS_CONFIG[normalizedStatus] ||
              APPLICATION_STATUS_CONFIG[normalizedStatus.toUpperCase()] || {
                label: normalizedStatus,
                badgeClass: "bg-bg text-text-muted border-border",
              };

            return (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${cfg.badgeClass}`}
              >
                {cfg.label}
              </span>
            );
          },
        }),

        // Cột 6: Thao tác duyệt hồ sơ (Kích thước & căn lề đồng đều h-8 w-40)
        columnHelper.display({
          id: "changeStatusAction",
          header: () => <div className="text-center">Thao tác</div>,
          cell: ({ row }) => {
            const app = row.original;
            const nextAllowedOptions = getAllowedStatusTransitions(
              app.status,
              isJobClosed,
            );

            // Nếu trạng thái đã là Terminal (Hired, Rejected, Withdrawn)
            if (nextAllowedOptions.length === 0) {
              return (
                <div className="flex justify-center">
                  <div className="flex h-8 w-40 items-center justify-center rounded-xl border border-border bg-slate-50 text-xs font-medium text-text-muted select-none">
                    <span>Hoàn tất quy trình</span>
                  </div>
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
                    className="flex h-8 w-40 cursor-pointer items-center justify-between rounded-xl border border-border bg-white px-3 text-xs font-semibold text-text-main transition-colors hover:border-primary hover:text-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="truncate">Chuyển trạng thái...</span>
                    <Select.Icon className="shrink-0 text-text-muted transition-transform duration-200 group-data-popup-open:rotate-180">
                      <ChevronDown className="size-3" />
                    </Select.Icon>
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Positioner
                      alignItemWithTrigger={false}
                      sideOffset={4}
                    >
                      <Select.Popup className="z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-md">
                        <Select.List>
                          {nextAllowedOptions.map((opt) => (
                            <Select.Item
                              key={opt.value}
                              value={opt.value}
                              className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 ${
                                normalizeApplicationStatus(opt.value) ===
                                APPLICATION_STATUS.REJECTED
                                  ? "text-status-error hover:bg-status-error/10"
                                  : "text-text-main hover:text-primary"
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
    [isUpdatingStatus, isJobClosed],
  );

  return (
    <div className="space-y-4">
      {/* 1. Quick Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-4">
          <span className="text-xs font-medium text-text-muted">
            Tổng hồ sơ
          </span>
          <p className="mt-1 text-2xl font-semibold text-text-main">
            {applications.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4">
          <span className="text-xs font-medium text-text-muted">
            Đang xem xét
          </span>
          <p className="mt-1 text-2xl font-semibold text-text-main">
            {reviewingCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4">
          <span className="text-xs font-medium text-text-muted">
            Mời phỏng vấn
          </span>
          <p className="mt-1 text-2xl font-semibold text-text-main">
            {interviewCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4">
          <span className="text-xs font-medium text-text-muted">
            Đã trúng tuyển
          </span>
          <p className="mt-1 text-2xl font-semibold text-text-main">
            {acceptedCount}
          </p>
        </div>
      </div>

      {/* 2. Toolbar & Bộ lọc */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Tìm kiếm ứng viên */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm theo tên ứng viên, email hoặc nội dung thư..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg py-2 pr-8 pl-9 text-xs text-text-main transition-colors placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-main"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Lọc theo trạng thái hồ sơ */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5">
          <Filter className="size-3.5 text-text-muted" />
          <span className="text-xs text-text-muted">Trạng thái:</span>
          <Select.Root
            items={APPLICATION_STATUS_OPTIONS}
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val || "ALL")}
          >
            <Select.Trigger
              aria-label="Lọc theo trạng thái ứng viên"
              className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-text-main focus:outline-none"
            >
              <Select.Value />
              <Select.Icon className="text-text-muted transition-transform duration-200 group-data-popup-open:rotate-180">
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
                        className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-text-main transition-colors hover:bg-slate-100 data-[state=checked]:font-semibold data-[state=checked]:text-primary"
                      >
                        <Select.ItemText>{opt.label}</Select.ItemText>
                        <Select.ItemIndicator
                          animation="pop"
                          className="ml-2 text-xs text-primary"
                        >
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
      <Dialog
        open={Boolean(selectedLetterApp)}
        onOpenChange={(open) => {
          if (!open) setSelectedLetterApp(null);
        }}
      >
        <DialogContent className="w-full sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thư giới thiệu của ứng viên</DialogTitle>
            <DialogDescription>
              {selectedLetterApp
                ? `${resolveCandidateProfile(selectedLetterApp).name} • Nộp lúc ${dayjs(selectedLetterApp.appliedAt).format("DD/MM/YYYY HH:mm")}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-72 overflow-y-auto rounded-xl border border-border bg-bg p-4">
            <p className="text-xs leading-relaxed whitespace-pre-line text-text-main sm:text-sm">
              {selectedLetterApp?.coverLetter ||
                "Ứng viên không đính kèm thư giới thiệu."}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => setSelectedLetterApp(null)}
              className="px-4! py-1.5! text-xs! font-medium!"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 5. Modal Xác nhận chuyển trạng thái hồ sơ theo State Machine */}
      <Dialog
        open={Boolean(pendingChange)}
        onOpenChange={(open) => {
          if (!open && !isSubmittingTransition) {
            setPendingChange(null);
          }
        }}
      >
        <DialogContent className="w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận chuyển trạng thái</DialogTitle>
            <DialogDescription>
              {pendingChange
                ? `Chuyển hồ sơ ứng viên ${resolveCandidateProfile(pendingChange.app).name} từ "${APPLICATION_STATUS_CONFIG[pendingChange.fromStatus]?.label || pendingChange.fromStatus}" sang "${APPLICATION_STATUS_CONFIG[pendingChange.toStatus]?.label || pendingChange.toStatus}".`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-text-main">
                Ghi chú nội bộ (tùy chọn)
              </label>
              <p className="mt-0.5 text-[11px] text-text-muted">
                Lưu lại lý do hoặc thông tin cho vòng xử lý này (tối đa 2,000 ký
                tự).
              </p>
              <textarea
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Ví dụ: Đạt yêu cầu CV, hẹn phỏng vấn kỹ thuật vào thứ 5 tuần tới..."
                className="mt-1.5 w-full rounded-xl border border-border bg-bg p-2.5 text-xs text-text-main placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4">
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
              isLoading={isSubmittingTransition}
              onClick={handleConfirmTransition}
              className="px-4! py-1.5! text-xs! font-semibold!"
            >
              Xác nhận chuyển
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
