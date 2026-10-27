import { useState, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Eye,
  FileText,
  Filter,
  MapPin,
  Globe,
  ExternalLink,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase,
  Building2,
  Calendar,
  FileQuestion,
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
  useMyApplications,
  useApplicationStatusHistory,
} from "@/hooks/queries/useApplication";
import {
  APPLICATION_STATUS_CONFIG,
  APPLICATION_STATUS_OPTIONS,
  type CandidateMyApplicationItem,
  type ApplicationStatusHistoryItem,
} from "@/types/application";

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

  // Client-side search filter theo tên công việc hoặc tên công ty
  const filteredApplications = useMemo(() => {
    if (!searchTerm.trim()) return rawApplications;
    const term = searchTerm.toLowerCase();
    return rawApplications.filter(
      (app) =>
        (app.jobTitle && app.jobTitle.toLowerCase().includes(term)) ||
        (app.companyName && app.companyName.toLowerCase().includes(term)),
    );
  }, [rawApplications, searchTerm]);

  // Modal xem chi tiết & Timeline tiến trình
  const [selectedApplication, setSelectedApplication] =
    useState<CandidateMyApplicationItem | null>(null);

  // Hook lấy lịch sử trạng thái của application đang xem
  const { data: historyList = [], isLoading: isLoadingHistory } =
    useApplicationStatusHistory(selectedApplication?.id);

  // Thống kê nhanh số lượng theo trạng thái
  const stats = useMemo(() => {
    return {
      total: totalItems,
      reviewing: rawApplications.filter((a) => a.status === "REVIEWING").length,
      interview: rawApplications.filter(
        (a) => a.status === "INTERVIEW" || a.status === "INTERVIEWING",
      ).length,
      offered: rawApplications.filter(
        (a) =>
          a.status === "OFFERED" ||
          a.status === "HIRED" ||
          a.status === "ACCEPTED",
      ).length,
    };
  }, [rawApplications, totalItems]);

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
                {app.companyLogoUrl ? (
                  <img
                    src={app.companyLogoUrl}
                    alt={app.companyName || "Logo"}
                    className="size-10 shrink-0 rounded-xl border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-slate-100 text-xs font-bold text-slate-500">
                    {(app.companyName || "DN").slice(0, 2).toUpperCase()}
                  </div>
                )}
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
                    rel="noreferrer"
                    title="Mở file CV PDF đã tải lên"
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-primary hover:text-primary"
                  >
                    <FileText className="size-3.5" />
                    <span>File CV</span>
                    <ExternalLink className="size-3 opacity-60" />
                  </a>
                ) : (
                  <span
                    title={
                      app.cvVersionId
                        ? `Phiên bản CV: ${app.cvVersionId}`
                        : "CV trực tuyến chuẩn ATS"
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-primary hover:text-primary"
                  >
                    <Globe className="size-3.5 text-primary" />
                    <span>CV Online</span>
                  </span>
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
            const statusKey = row.original.status as string;
            const cfg = APPLICATION_STATUS_CONFIG[statusKey] || {
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
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-text-muted">
            Tổng đơn nộp
          </span>
          <span className="mt-2 text-2xl font-bold text-slate-900">
            {stats.total}
          </span>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-sky-600">Đang xem xét</span>
          <span className="mt-2 text-2xl font-bold text-sky-700">
            {stats.reviewing}
          </span>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-amber-600">Phỏng vấn</span>
          <span className="mt-2 text-2xl font-bold text-amber-700">
            {stats.interview}
          </span>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-emerald-600">
            Được đề nghị việc
          </span>
          <span className="mt-2 text-2xl font-bold text-emerald-700">
            {stats.offered}
          </span>
        </div>
      </div>

      {/* 2. Main Tracking Table Section with Filter & Search */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-2xs">
        {/* Toolbar: Search input + Status Select Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo vị trí, công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-slate-50/50 py-2 pr-3 pl-9 text-xs text-text-main placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-1.5 shadow-2xs">
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
                    <Select.Popup className="z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-md">
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
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 w-full animate-pulse rounded-xl border border-border bg-slate-50"
              />
            ))}
          </div>
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
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <FileQuestion className="size-10 text-slate-400" />
            <h3 className="mt-3 text-sm font-semibold text-slate-700">
              Không tìm thấy hồ sơ nào
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm của bạn.
            </p>
          </div>
        )}
      </section>

      {/* 3. Modal Dialog xem chi tiết đơn ứng tuyển và Timeline lịch sử tiến trình */}
      <Dialog
        open={!!selectedApplication}
        onOpenChange={(open) => {
          if (!open) setSelectedApplication(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
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
                {selectedApplication.companyLogoUrl ? (
                  <img
                    src={selectedApplication.companyLogoUrl}
                    alt={selectedApplication.companyName || "Logo"}
                    className="size-11 shrink-0 rounded-xl border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-xs font-bold text-slate-600">
                    <Building2 className="size-5 text-slate-400" />
                  </div>
                )}
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
                <div className="rounded-xl border border-border bg-white p-3">
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
                ) : historyList.length > 0 ? (
                  <div className="relative ml-3 space-y-4 border-l-2 border-slate-200 py-1 pl-4">
                    {historyList.map(
                      (step: ApplicationStatusHistoryItem, idx: number) => {
                        const isLatest = idx === historyList.length - 1;

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

                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-text-muted">
                                  {dayjs(step.changedAt).format(
                                    "DD/MM/YYYY HH:mm",
                                  )}
                                </span>
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
                      ?.label || selectedApplication.status}
                    ). Nhà tuyển dụng chưa có ghi nhận thay đổi mới.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
