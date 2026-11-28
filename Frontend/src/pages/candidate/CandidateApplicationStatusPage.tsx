import { EmptyState } from "@/assets/images/decoration";
import { getLoremAvt } from "@/utils/helper";
import { useState, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Eye,
  FileText,
  Filter,
  MapPin,
  Globe,
  ChevronDown,
  Search,
  Clock,
  Briefcase,
  Calendar,
  UserMinus,
} from "lucide-react";
import dayjs from "dayjs";
import {
  BasePagination,
  Button,
  DataTable,
  TableSkeleton,
  type DataTableFeatures,
} from "@/components/common";
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
  useMyApplications,
  useApplicationStatusHistory,
  useWithdrawApplication,
} from "@/hooks/queries/useApplication";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_CONFIG,
  APPLICATION_STATUS_OPTIONS,
  normalizeApplicationStatus,
  isPendingStatus,
  canWithdrawStatus,
  type CandidateMyApplicationItem,
  type ApplicationStatusHistoryItem,
} from "@/types/application";
import { ApplicationCvPreviewDialog } from "@/pages/recruiter/candidate/ApplicationCvPreviewDialog";
import { JobDetailDrawer } from "@/components/job";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<
  DataTableFeatures,
  CandidateMyApplicationItem
>();

export default function CandidateApplicationStatusPage() {
  // Query parameters state
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Lấy danh sách đơn ứng tuyển từ Backend
  const { data: appData, isLoading } = useMyApplications({
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    page: currentPage,
    pageSize,
  });
  const rawApplications = useMemo(() => appData?.items ?? [], [appData?.items]);
  const totalItems = appData?.totalItems ?? rawApplications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Lấy toàn bộ đơn để thống kê chính xác các thẻ đầu trang (không bị ảnh hưởng bởi bộ lọc hay phân trang)
  const { data: allAppsData } = useMyApplications({
    page: 1,
    pageSize: 100,
  });
  const allApplications = useMemo(
    () => allAppsData?.items ?? [],
    [allAppsData?.items],
  );

  // Client-side search & status filter theo tên công việc, công ty và trạng thái
  const filteredApplications = useMemo(() => {
    let result = rawApplications;

    if (selectedStatus !== "ALL") {
      const targetNormalized = normalizeApplicationStatus(selectedStatus);
      result = result.filter((app) => normalizeApplicationStatus(app.status) === targetNormalized);
    }

    if (!searchTerm.trim()) return result;
    const term = searchTerm.toLowerCase();
    return result.filter(
      (app) =>
        (app.jobTitle && app.jobTitle.toLowerCase().includes(term)) ||
        (app.companyName && app.companyName.toLowerCase().includes(term)),
    );
  }, [rawApplications, selectedStatus, searchTerm]);

  // Modal xem chi tiết & Timeline tiến trình
  const [selectedApplication, setSelectedApplication] =
    useState<CandidateMyApplicationItem | null>(null);
  // Drawer xem chi tiết JD công việc
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  // Modal xem trước CV hệ thống
  const [previewCvApp, setPreviewCvApp] =
    useState<CandidateMyApplicationItem | null>(null);
  // State rút hồ sơ ứng tuyển
  const [withdrawTargetApp, setWithdrawTargetApp] =
    useState<CandidateMyApplicationItem | null>(null);
  const [withdrawReason, setWithdrawReason] = useState<string>("");
  const { mutate: withdrawApplication, isPending: isWithdrawing } =
    useWithdrawApplication();

  const isJobClosed = (jobStatus?: string | null) => {
    return (jobStatus || "").trim().toUpperCase() === "CLOSED";
  };

  const isAlreadyWithdrawn = (status?: string | null) => {
    return normalizeApplicationStatus(status) === APPLICATION_STATUS.WITHDRAWN;
  };

  // Hook lấy lịch sử trạng thái của application đang xem
  const { data: historyList = [], isLoading: isLoadingHistory } =
    useApplicationStatusHistory(selectedApplication?.id);

  // Sắp xếp timeline theo thứ tự thời gian tăng dần để xác định chính xác isLatest
  const sortedHistory = useMemo(() => {
    if (!historyList || historyList.length === 0) return [];
    return [...historyList].sort((a, b) => {
      const timeA = new Date(a.changedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.changedAt || b.createdAt || 0).getTime();
      return timeA - timeB;
    });
  }, [historyList]);

  // Thống kê nhanh số lượng theo trạng thái độc lập
  const stats = useMemo(() => {
    return {
      total: allAppsData?.totalItems ?? allApplications.length,
      reviewing: allApplications.filter((a) => {
        return normalizeApplicationStatus(a.status) === APPLICATION_STATUS.REVIEWING;
      }).length,
      interview: allApplications.filter((a) => {
        return normalizeApplicationStatus(a.status) === APPLICATION_STATUS.INTERVIEWING;
      }).length,
      offered: allApplications.filter((a) => {
        const norm = normalizeApplicationStatus(a.status);
        return norm === APPLICATION_STATUS.OFFERED || norm === APPLICATION_STATUS.HIRED;
      }).length,
    };
  }, [allApplications, allAppsData?.totalItems]);

  // Columns definition cho DataTable
  const columns = useMemo(() => {
    const renderCvAction = (app: CandidateMyApplicationItem) =>
      app.uploadedCvUrl ? (
        <a
          href={app.uploadedCvUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Mở file CV PDF đã tải lên"
          className="btn btn-secondary gap-1.5 rounded-lg! text-xs! text-text-muted! ring-border!"
        >
          <span>Xem CV</span>
          <FileText className="size-3.5" />
        </a>
      ) : (
        <Button
          onClick={() => setPreviewCvApp(app)}
          disabled={!app.cvSnapshot && !app.cvVersionId}
          aria-label="Xem trước CV hệ thống"
          variant="secondary"
          iconPosition="right"
          icon={Globe}
          className="rounded-lg! text-xs! text-text-muted! ring-border!"
        >
          Xem CV
        </Button>
      );

    return columnHelper.columns([
      columnHelper.accessor("jobTitle", {
        id: "jobInfo",
        header: "Vị trí & Công ty",
        cell: ({ row }) => {
          const app = row.original;
          return (
            <div className="flex max-w-72 min-w-48 items-center gap-3">
              <img
                src={app.companyLogoUrl || getLoremAvt(app.companyName)}
                alt={app.companyName || "Logo"}
                loading="lazy"
                onError={(event) => {
                  const fallback = getLoremAvt(app.companyName);
                  const img = event.currentTarget;
                  if (img.src !== new URL(fallback, img.baseURI).href) {
                    img.onerror = null;
                    img.src = fallback;
                  }
                }}
                className="size-10 shrink-0 rounded-xl border border-border object-cover"
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        onClick={() => setSelectedJobId(app.jobId || app.job?.id || null)}
                        className="truncate text-left text-sm font-semibold text-text-main transition-colors hover:text-primary cursor-pointer"
                      >
                        {app.jobTitle}
                      </button>
                    }
                  />
                  <TooltipPanel>Bấm để xem chi tiết tin tuyển dụng: {app.jobTitle}</TooltipPanel>
                </Tooltip>
                <span className="truncate text-xs text-text-muted">
                  {app.companyName}
                </span>
                {app.locationName && (
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-text-muted md:hidden">
                    <MapPin className="size-3" />
                    {app.locationName}
                  </span>
                )}
                <div className="mt-1.5 flex items-center lg:hidden">
                  {renderCvAction(app)}
                </div>
              </div>
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "location",
        header: "Địa điểm & Mức lương",
        meta: { className: "hidden md:table-cell" },
        cell: ({ row }) => {
          const app = row.original;
          return (
            <div className="flex flex-col gap-0.5 text-xs">
              <span className="font-semibold text-text-main">
                {app.salaryRange || "Thỏa thuận"}
              </span>
              <span className="text-text-muted">
                {app.locationName || "Toàn quốc"}
              </span>
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "documents",
        header: "Hồ sơ ứng tuyển",
        meta: { className: "hidden lg:table-cell" },
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            {renderCvAction(row.original)}
          </div>
        ),
      }),

      columnHelper.accessor("appliedAt", {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-text-muted transition-colors hover:text-primary"
          >
            <span>Ngày nộp</span>
            <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const iso = row.original.appliedAt;
          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-text-main">
                {dayjs(iso).format("DD/MM/YYYY")}
              </span>
              <span className="text-[11px] text-text-muted">
                {dayjs(iso).format("HH:mm")}
              </span>
            </div>
          );
        },
      }),

      columnHelper.accessor("status", {
        header: "Trạng thái",
        filterFn: "includesString",
        cell: ({ row }) => {
          const statusKey = (row.original.status as string) || "";
          const cfg = APPLICATION_STATUS_CONFIG[statusKey] ||
            APPLICATION_STATUS_CONFIG[statusKey.toUpperCase()] || {
              label: statusKey,
              badgeClass: "bg-bg text-text-main border-border",
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

      columnHelper.display({
        id: "actions",
        header: () => <div className="text-center">Thao tác</div>,
        cell: ({ row }) => {
          const app = row.original;
          const allowed = canWithdrawStatus(app.status);
          const withdrawn = isAlreadyWithdrawn(app.status);

          return (
            <div className="flex items-center justify-center gap-1.5">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => setSelectedApplication(app)}
                      className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-border bg-white text-text-muted transition-colors hover:border-primary hover:text-primary"
                    >
                      <Eye className="size-3.5" />
                    </button>
                  }
                />
                <TooltipPanel>Xem tiến trình hồ sơ</TooltipPanel>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      disabled={!allowed}
                      onClick={() => {
                        setWithdrawTargetApp(app);
                        setWithdrawReason("");
                      }}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg border border-border bg-white transition-colors",
                        allowed
                          ? "cursor-pointer text-status-error hover:border-status-error/30 hover:bg-status-error/10 hover:text-status-error"
                          : "cursor-not-allowed text-text-muted/30 opacity-40",
                      )}
                    >
                      <UserMinus className="size-3.5" />
                    </button>
                  }
                />
                <TooltipPanel>
                  {withdrawn
                    ? "Hồ sơ đã được rút"
                    : allowed
                      ? "Rút hồ sơ ứng tuyển"
                      : "Không thể rút hồ sơ sau khi đã bước vào vòng phỏng vấn"}
                </TooltipPanel>
              </Tooltip>
            </div>
          );
        },
      }),
    ]);
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Stat Cards */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-text-main sm:text-2xl">
          Trạng thái hồ sơ ứng tuyển
        </h1>
        <p className="text-xs text-text-muted sm:text-sm">
          Theo dõi tiến trình xét duyệt hồ sơ từ các nhà tuyển dụng và lịch sử
          cập nhật.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4">
          <span className="text-xs font-medium text-text-muted">
            Tổng đơn nộp
          </span>
          <span className="mt-2 text-2xl font-semibold text-text-main">
            {stats.total}
          </span>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4">
          <span className="text-xs font-medium text-text-muted">Đang xem xét</span>
          <span className="mt-2 text-2xl font-semibold text-text-main">
            {stats.reviewing}
          </span>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4">
          <span className="text-xs font-medium text-text-muted">Phỏng vấn</span>
          <span className="mt-2 text-2xl font-semibold text-text-main">
            {stats.interview}
          </span>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4">
          <span className="text-xs font-medium text-text-muted">
            Được đề nghị việc
          </span>
          <span className="mt-2 text-2xl font-semibold text-text-main">
            {stats.offered}
          </span>
        </div>
      </div>

      {/* 2. Main Tracking Table Section with Filter & Search */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-2xs">
        {/* Toolbar: Search input + Status Select Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo vị trí, công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-slate-50/50 py-2 pr-3 pl-9 text-xs text-text-main placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 shadow-2xs">
              <Filter className="size-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Trạng thái:</span>

              <Select.Root
                items={APPLICATION_STATUS_OPTIONS}
                value={selectedStatus}
                onValueChange={(val) => {
                  setSelectedStatus(val ?? "ALL");
                  setCurrentPage(1);
                }}
              >
                <Select.Trigger
                  aria-label="Lọc theo trạng thái"
                  className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <Select.Value />
                  <Select.Icon className="text-slate-400 transition-transform duration-200 group-data-popup-open:rotate-180">
                    <ChevronDown className="size-3.5" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Positioner
                    alignItemWithTrigger={false}
                    sideOffset={4}
                  >
                    <Select.Popup className="z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-md">
                      <Select.List>
                        {APPLICATION_STATUS_OPTIONS.map((status) => (
                          <Select.Item
                            key={status.value}
                            value={status.value}
                            className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-100 data-highlighted:bg-slate-100 data-[state=checked]:font-semibold data-[state=checked]:text-primary"
                          >
                            <Select.ItemText>{status.label}</Select.ItemText>
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
        </div>

        {/* Bảng dữ liệu ứng tuyển */}
        {isLoading ? (
          <TableSkeleton />
        ) : filteredApplications.length > 0 ? (
          <>
            <DataTable
              columns={columns}
              data={filteredApplications}
              initialSorting={[{ id: "appliedAt", desc: true }]}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-3 sm:flex-row">
                <span className="text-xs text-text-muted">
                  Hiển thị{" "}
                  <span className="font-semibold text-text-main">
                    {(currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-text-main">
                    {Math.min(currentPage * pageSize, totalItems)}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-semibold text-text-main">
                    {totalItems}
                  </span>{" "}
                  đơn
                </span>

                <BasePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="mx-0 w-auto justify-end"
                />
              </div>
            )}
          </>
        ) : (
          <section className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
            <img
              src={EmptyState}
              alt="Không tìm thấy hồ sơ nào"
              loading="lazy"
              className="h-80 w-auto md:h-100"
            />
            <h2 className="text-base font-semibold text-text-main">
              Không tìm thấy hồ sơ nào
            </h2>
            <p className="max-w-xs text-xs text-text-muted">
              Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm của bạn.
            </p>
          </section>
        )}
      </section>

      {/* 3. Modal Dialog xem chi tiết đơn ứng tuyển và Timeline lịch sử tiến trình */}
      <Dialog
        open={!!selectedApplication}
        onOpenChange={(open) => {
          if (!open) setSelectedApplication(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] overflow-y-auto p-4 sm:w-full sm:max-w-lg sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-text-main">
              Chi tiết tiến trình hồ sơ
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Lịch sử các bước xử lý từ nhà tuyển dụng
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="w-full min-w-0 space-y-4 pt-2">
              {/* Job summary card */}
              <div className="flex w-full min-w-0 items-start gap-3 rounded-xl border border-border bg-bg/60 p-3 sm:p-3.5">
                <img
                  src={
                    selectedApplication.companyLogoUrl ||
                    getLoremAvt(selectedApplication.companyName)
                  }
                  alt={selectedApplication.companyName || "Logo"}
                  loading="lazy"
                  onError={(event) => {
                    const fallback = getLoremAvt(
                      selectedApplication.companyName,
                    );
                    const img = event.currentTarget;
                    if (img.src !== new URL(fallback, img.baseURI).href) {
                      img.onerror = null;
                      img.src = fallback;
                    }
                  }}
                  className="size-11 shrink-0 rounded-xl border border-border object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h4 className="wrap-break-words text-sm leading-snug font-semibold text-text-main">
                    <button
                      type="button"
                      onClick={() => setSelectedJobId(selectedApplication.jobId || selectedApplication.job?.id || null)}
                      className="text-left font-semibold text-text-main transition-colors hover:text-primary cursor-pointer"
                    >
                      {selectedApplication.jobTitle}
                    </button>
                  </h4>
                  <span className="wrap-break-words text-xs leading-relaxed text-text-muted">
                    {selectedApplication.companyName}
                  </span>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="size-3 shrink-0 text-text-muted/70" />
                      <span>{selectedApplication.salaryRange}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3 shrink-0 text-text-muted/70" />
                      <span>
                        Nộp ngày{" "}
                        {dayjs(selectedApplication.appliedAt).format(
                          "DD/MM/YYYY",
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Passive Notice nếu Job đã tạm đóng trong khi hồ sơ ứng viên vẫn đang trong diện xem xét / phỏng vấn */}
              {isJobClosed(selectedApplication.job?.status) &&
                isPendingStatus(selectedApplication.status) && (
                  <div className="w-full min-w-0 rounded-xl border border-border/60 bg-surface p-3 text-xs leading-relaxed text-text-muted">
                    Vị trí này hiện đã tạm đóng nhận hồ sơ mới do đạt đủ đề xuất (Offer) dự kiến. Hồ sơ của bạn vẫn được lưu trong danh sách ưu tiên và sẽ được tiếp tục xem xét nếu có thay đổi.
                  </div>
                )}

              {/* Cover Letter nếu có */}
              {selectedApplication.coverLetter && (
                <div className="w-full min-w-0 rounded-xl border border-border bg-surface p-3">
                  <span className="text-xs font-semibold text-text-main">
                    Thư giới thiệu của bạn:
                  </span>
                  <p className="wrap-break-words mt-1 max-h-32 overflow-y-auto text-xs leading-relaxed whitespace-pre-line text-text-muted">
                    {selectedApplication.coverLetter}
                  </p>
                </div>
              )}

              {/* Timeline lịch sử tiến trình */}
              <div className="w-full min-w-0 space-y-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-text-main">
                  <Clock className="size-3.5 text-primary" />
                  Dòng thời gian xét duyệt
                </span>

                {isLoadingHistory ? (
                  <div className="space-y-2 py-3">
                    <div className="h-8 animate-pulse rounded-lg bg-bg" />
                    <div className="h-8 animate-pulse rounded-lg bg-bg" />
                  </div>
                ) : sortedHistory.length > 0 ? (
                  <div className="relative ml-2.5 space-y-4 border-l-2 border-primary/20 py-1 pl-3.5 sm:ml-3 sm:pl-4">
                    {sortedHistory.map(
                      (step: ApplicationStatusHistoryItem, idx: number) => {
                        const isLatest = idx === sortedHistory.length - 1;
                        const stepTime = step.changedAt || step.createdAt;
                        const currentStatusKey = (
                          step.newStatus ||
                          step.status ||
                          ""
                        ).toUpperCase();
                        const oldStatusKey = (
                          step.oldStatus || ""
                        ).toUpperCase();
                        const currentConfig = currentStatusKey
                          ? APPLICATION_STATUS_CONFIG[currentStatusKey]
                          : undefined;
                        const statusLabel =
                          currentConfig?.label ||
                          currentStatusKey ||
                          "Cập nhật trạng thái";
                        const oldConfig = oldStatusKey
                          ? APPLICATION_STATUS_CONFIG[oldStatusKey]
                          : undefined;
                        const oldLabel = oldConfig?.label || oldStatusKey;

                        return (
                          <div
                            key={step.id || idx}
                            className="group relative w-full min-w-0"
                          >
                            {/* Dot indicator */}
                            <div
                              className={`absolute top-1 -left-5.25 size-3.5 rounded-full border-2 border-surface shadow-xs sm:-left-5.75 ${
                                isLatest
                                  ? "bg-primary ring-4 ring-primary/20"
                                  : "bg-primary/40"
                              }`}
                            />

                            <div className="flex w-full min-w-0 flex-col gap-1">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary break-words"/>
                                  <span
                                    className={cn(
                                      "wrap-break-words inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
                                      currentConfig?.badgeClass ||
                                        "border-border bg-bg text-text-main",
                                    )}
                                  >
                                    {statusLabel}
                                  </span>
                                  {oldLabel && oldLabel !== statusLabel && (
                                    <span className="wrap-break-words text-[11px] text-text-muted">
                                      (từ {oldLabel})
                                    </span>
                                  )}
                                </div>

                                {stepTime && (
                                  <span className="shrink-0 text-[11px] text-text-muted">
                                    {dayjs(stepTime).format("DD/MM/YYYY HH:mm")}
                                  </span>
                                )}
                              </div>

                              {step.note && (
                                <p className="wrap-break-words mt-1 rounded-lg border border-border/50 bg-bg p-2 text-xs leading-relaxed text-text-muted">
                                  {step.note}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <div className="wrap-break-words w-full rounded-xl border border-dashed border-border p-4 text-center text-xs leading-relaxed text-text-muted">
                    Đơn ứng tuyển đang ở trạng thái ban đầu (
                    {APPLICATION_STATUS_CONFIG[selectedApplication.status]
                      ?.label ||
                      APPLICATION_STATUS_CONFIG[
                        (selectedApplication.status || "").toUpperCase()
                      ]?.label ||
                      selectedApplication.status}
                    ). Nhà tuyển dụng chưa có ghi nhận thay đổi mới.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Dialog Xác nhận rút hồ sơ ứng tuyển */}
      <Dialog
        open={Boolean(withdrawTargetApp)}
        onOpenChange={(open) => {
          if (!open) {
            setWithdrawTargetApp(null);
            setWithdrawReason("");
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] p-4 sm:w-full sm:max-w-md sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-status-error">
              Xác nhận rút hồ sơ ứng tuyển
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Sau khi rút hồ sơ, nhà tuyển dụng sẽ không tiếp tục xét duyệt đơn
              này của bạn nữa.
            </DialogDescription>
          </DialogHeader>

          {withdrawTargetApp && (
            <div className="space-y-4 pt-1">
              <div className="rounded-xl border border-border bg-bg/60 p-3 text-xs">
                <p className="font-semibold text-text-main">
                  {withdrawTargetApp.jobTitle}
                </p>
                <p className="text-text-muted">
                  {withdrawTargetApp.companyName}
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="withdraw-reason"
                  className="text-xs font-medium text-text-main"
                >
                  Lý do rút hồ sơ (không bắt buộc):
                </label>
                <textarea
                  id="withdraw-reason"
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  placeholder="Ví dụ: Đã tìm được công việc phù hợp hơn, có kế hoạch khác..."
                  rows={3}
                  maxLength={500}
                  className="w-full resize-none rounded-lg border border-border bg-surface p-2.5 text-xs text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setWithdrawTargetApp(null);
                    setWithdrawReason("");
                  }}
                  disabled={isWithdrawing}
                  className="text-xs"
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="primary"
                  disabled={isWithdrawing}
                  onClick={() => {
                    if (!withdrawTargetApp) return;
                    withdrawApplication(
                      {
                        applicationId: withdrawTargetApp.id,
                        reason: withdrawReason.trim() || undefined,
                      },
                      {
                        onSuccess: () => {
                          setWithdrawTargetApp(null);
                          setWithdrawReason("");
                        },
                      },
                    );
                  }}
                  className="bg-status-error! text-xs text-white! hover:bg-status-error/90!"
                >
                  {isWithdrawing ? "Đang xử lý..." : "Xác nhận rút hồ sơ"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ApplicationCvPreviewDialog
        application={previewCvApp}
        onClose={() => setPreviewCvApp(null)}
      />

      {/* Drawer xem chi tiết công việc ở chế độ Read-only khi bấm từ lịch sử ứng tuyển */}
      <JobDetailDrawer
        jobId={selectedJobId || undefined}
        open={!!selectedJobId}
        onClose={() => setSelectedJobId(null)}
      />
    </div>
  );
}
