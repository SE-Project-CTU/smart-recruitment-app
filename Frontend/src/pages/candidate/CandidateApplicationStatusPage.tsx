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
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase,
  Calendar,
} from "lucide-react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import {
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
} from "@/hooks/queries/useApplication";
import {
  APPLICATION_STATUS_CONFIG,
  APPLICATION_STATUS_OPTIONS,
  type CandidateMyApplicationItem,
  type ApplicationStatusHistoryItem,
} from "@/types/application";
import { ApplicationCvPreviewDialog } from "@/pages/recruiter/candidate/ApplicationCvPreviewDialog";

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
  const allApplications = useMemo(() => allAppsData?.items ?? [], [allAppsData?.items]);

  // Client-side search & status filter theo tên công việc, công ty và trạng thái
  const filteredApplications = useMemo(() => {
    let result = rawApplications;

    if (selectedStatus !== "ALL") {
      const sf = selectedStatus.toUpperCase();
      result = result.filter((app) => {
        const s = (app.status || "").toUpperCase();
        if (sf === "SUBMITTED" || sf === "APPLIED" || sf === "RECEIVED") {
          return s === "SUBMITTED" || s === "APPLIED" || s === "RECEIVED";
        }
        if (sf === "INTERVIEW" || sf === "INTERVIEWING") {
          return s === "INTERVIEW" || s === "INTERVIEWING";
        }
        if (sf === "HIRED" || sf === "ACCEPTED") {
          return s === "HIRED" || s === "ACCEPTED";
        }
        return s === sf;
      });
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
  // Modal xem trước CV hệ thống
  const [previewCvApp, setPreviewCvApp] =
    useState<CandidateMyApplicationItem | null>(null);

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
        const s = (a.status || "").toUpperCase();
        return s === "REVIEWING";
      }).length,
      interview: allApplications.filter((a) => {
        const s = (a.status || "").toUpperCase();
        return s === "INTERVIEW" || s === "INTERVIEWING";
      }).length,
      offered: allApplications.filter((a) => {
        const s = (a.status || "").toUpperCase();
        return s === "OFFERED" || s === "HIRED" || s === "ACCEPTED";
      }).length,
    };
  }, [allApplications, allAppsData?.totalItems]);

  // Columns definition cho DataTable
  const columns = useMemo(
    () =>
      columnHelper.columns([
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
                        <span className="truncate text-sm font-bold text-slate-800 transition-colors hover:text-primary">
                          {app.jobTitle}
                        </span>
                      }
                    />
                    <TooltipPanel>{app.jobTitle}</TooltipPanel>
                  </Tooltip>
                  <span className="truncate text-xs text-text-muted">
                    {app.companyName}
                  </span>
                  {app.locationName && (
                    <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 md:hidden">
                      <MapPin className="size-3" />
                      {app.locationName}
                    </span>
                  )}
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
                <span className="font-semibold text-slate-800">
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
          cell: ({ row }) => {
            const app = row.original;
            return (
              <div className="flex items-center gap-1.5">
                {app.uploadedCvUrl ? (
                  <a
                    href={app.uploadedCvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Mở file CV PDF đã tải lên"
                    className="inline-flex items-center gap-1.5"
                  >
                    <Button
                      variant="secondary"
                      iconPosition="right"
                      icon={FileText}
                      className="rounded-lg! text-xs! text-text-muted! ring-border!"
                    >
                      Xem CV
                    </Button>
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
                )}
              </div>
            );
          },
        }),

        columnHelper.accessor("appliedAt", {
          header: ({ column }) => (
            <button
              type="button"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-slate-600 transition-colors hover:text-primary"
            >
              <span>Ngày nộp</span>
              <ArrowUpDown className="size-3.5" />
            </button>
          ),
          cell: ({ row }) => {
            const iso = row.original.appliedAt;
            return (
              <div className="flex flex-col text-xs">
                <span className="font-medium text-slate-700">
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

        columnHelper.display({
          id: "actions",
          header: () => <div className="text-center">Chi tiết</div>,
          cell: ({ row }) => {
            const app = row.original;
            return (
              <div className="flex justify-center">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="secondary"
                        icon={Eye}
                        iconSize={16}
                        onClick={() => setSelectedApplication(app)}
                        className="p-1.5! text-xs! ring-0!"
                      />
                    }
                  />
                  <TooltipPanel>Xem tiến trình hồ sơ</TooltipPanel>
                </Tooltip>
              </div>
            );
          },
        }),
      ]),
    [],
  );

  return (
    <div className="min-h-full space-y-6 pb-12">
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
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-2xs">
          <span className="text-xs font-medium text-text-muted">
            Tổng đơn nộp
          </span>
          <span className="mt-2 text-2xl font-bold text-slate-900">
            {stats.total}
          </span>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-2xs">
          <span className="text-xs font-medium text-sky-600">Đang xem xét</span>
          <span className="mt-2 text-2xl font-bold text-sky-700">
            {stats.reviewing}
          </span>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-2xs">
          <span className="text-xs font-medium text-amber-600">Phỏng vấn</span>
          <span className="mt-2 text-2xl font-bold text-amber-700">
            {stats.interview}
          </span>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-2xs">
          <span className="text-xs font-medium text-emerald-600">
            Được đề nghị việc
          </span>
          <span className="mt-2 text-2xl font-bold text-emerald-700">
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

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    icon={ChevronLeft}
                    iconSize={14}
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-8! px-2.5! text-xs!"
                  >
                    Trước
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`size-8 cursor-pointer rounded-lg text-xs font-semibold transition-colors ${
                            currentPage === page
                              ? "bg-primary text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  <Button
                    variant="secondary"
                    icon={ChevronRight}
                    iconSize={14}
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="h-8! px-2.5! text-xs!"
                  >
                    Sau
                  </Button>
                </div>
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
        <DialogContent className="min-w-fit sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Chi tiết tiến trình hồ sơ
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Lịch sử các bước xử lý từ nhà tuyển dụng
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4 pt-2">
              {/* Job summary card */}
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-slate-50/70 p-3.5">
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
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <h4 className="truncate text-sm font-bold text-slate-900">
                    {selectedApplication.jobTitle}
                  </h4>
                  <span className="truncate text-xs text-text-muted">
                    {selectedApplication.companyName}
                  </span>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="size-3 text-slate-400" />
                      {selectedApplication.salaryRange}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3 text-slate-400" />
                      Nộp ngày{" "}
                      {dayjs(selectedApplication.appliedAt).format(
                        "DD/MM/YYYY",
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cover Letter nếu có */}
              {selectedApplication.coverLetter && (
                <div className="rounded-xl border border-border bg-surface p-3">
                  <span className="text-xs font-semibold text-slate-700">
                    Thư giới thiệu của bạn:
                  </span>
                  <p className="mt-1 max-h-32 overflow-y-auto text-xs leading-relaxed whitespace-pre-line text-slate-600">
                    {selectedApplication.coverLetter}
                  </p>
                </div>
              )}

              {/* Timeline lịch sử tiến trình */}
              <div className="space-y-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Clock className="size-3.5 text-primary" />
                  Dòng thời gian xét duyệt
                </span>

                {isLoadingHistory ? (
                  <div className="space-y-2 py-3">
                    <div className="h-8 animate-pulse rounded-lg bg-slate-100" />
                    <div className="h-8 animate-pulse rounded-lg bg-slate-100" />
                  </div>
                ) : sortedHistory.length > 0 ? (
                  <div className="relative ml-3 space-y-4 border-l-2 border-slate-200 py-1 pl-4">
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
                          <div key={step.id || idx} className="group relative">
                            {/* Dot indicator */}
                            <div
                              className={`absolute top-1 -left-5.75 size-3.5 rounded-full border-2 border-white shadow-xs ${
                                isLatest
                                  ? "bg-primary ring-4 ring-primary/20"
                                  : "bg-slate-400"
                              }`}
                            />

                            <div className="flex flex-col gap-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span
                                    className={cn(
                                      "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
                                      currentConfig?.badgeClass ||
                                        "border-slate-200 bg-slate-100 text-slate-700",
                                    )}
                                  >
                                    {statusLabel}
                                  </span>
                                  {oldLabel && oldLabel !== statusLabel && (
                                    <span className="text-[11px] text-text-muted">
                                      (từ {oldLabel})
                                    </span>
                                  )}
                                </div>

                                {stepTime && (
                                  <span className="text-[11px] text-text-muted">
                                    {dayjs(stepTime).format("DD/MM/YYYY HH:mm")}
                                  </span>
                                )}
                              </div>

                              {step.note && (
                                <p className="mt-1 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
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
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
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

      <ApplicationCvPreviewDialog
        application={previewCvApp}
        onClose={() => setPreviewCvApp(null)}
      />
    </div>
  );
}
