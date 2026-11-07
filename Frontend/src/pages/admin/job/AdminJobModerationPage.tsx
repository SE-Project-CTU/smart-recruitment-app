import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Check,
  X,
  Eye,
  Search,
  RotateCw,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";

import { Button, TableSkeleton } from "@/components/common";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { EmptyStreet, EmptyState } from "@/assets/images/decoration";
import { JobModerationSheet } from "./JobModerationSheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useAdminJobPostings,
  useAdminDashboardOverview,
  useModerateJobPosting,
} from "@/hooks/queries/useAdmin";
import type { AdminJobPostingItem, AdminJobModerationStatus } from "@/types/admin";
import { formatSalaryRange } from "@/utils/jobHelpers";
import { cn } from "@/lib/utils";

dayjs.locale("vi");

type TabKey = "PendingReview" | "Published" | "Rejected" | "All";

interface TabConfig {
  key: TabKey;
  label: string;
}

const TABS: TabConfig[] = [
  { key: "PendingReview", label: "Chờ phê duyệt" },
  { key: "Published", label: "Đã xuất bản" },
  { key: "Rejected", label: "Bị từ chối" },
  { key: "All", label: "Tất cả tin" },
];

export default function AdminJobModerationPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc params từ URL
  const activeTab = (searchParams.get("tab") || "PendingReview") as TabKey;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const pageSize = 10;

  // Local state cho search input
  const [searchInput, setSearchInput] = useState(search);

  // Sheet xem nội dung tin chi tiết
  const [inspectingJob, setInspectingJob] =
    useState<AdminJobPostingItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Dialog xác nhận duyệt nhanh từ table row
  const [approveTarget, setApproveTarget] = useState<AdminJobPostingItem | null>(null);

  // Dialog từ chối kèm lý do từ table row
  const [rejectTarget, setRejectTarget] = useState<AdminJobPostingItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const moderateMutation = useModerateJobPosting();

  // Lấy tổng quan số lượng cho Tab badge
  const { data: overview } = useAdminDashboardOverview();
  const counts = useMemo(() => {
    return {
      PendingReview: overview?.jobPostings.pendingReview ?? 0,
      Published: overview?.jobPostings.open ?? 0,
      Rejected: overview?.jobPostings.closed ?? 0,
      All: overview?.jobPostings.total ?? 0,
    };
  }, [overview]);

  // Xác định status query param
  const queryStatus =
    activeTab === "All"
      ? undefined
      : (activeTab as AdminJobModerationStatus);

  // Query dữ liệu danh sách tin tuyển dụng
  const {
    data: pagedResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useAdminJobPostings({
    status: queryStatus,
    search: search || undefined,
    page,
    pageSize,
  });

  const jobs = pagedResponse?.data ?? [];
  const meta = pagedResponse?.meta;
  const totalItems = meta?.totalItems ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  // Cập nhật URL search params an toàn
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "") {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    setSearchParams(next);
  };

  const handleTabChange = (tabKey: TabKey) => {
    updateParams({ tab: tabKey, page: "1" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim(), page: "1" });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateParams({ search: null, page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateParams({ page: newPage.toString() });
  };

  // Mở Sheet kiểm duyệt chi tiết
  const handleInspect = (job: AdminJobPostingItem) => {
    setInspectingJob(job);
    setIsSheetOpen(true);
  };

  // Xử lý xác nhận duyệt xuất bản
  const handleConfirmApprove = async () => {
    if (!approveTarget) return;
    try {
      await moderateMutation.mutateAsync({
        id: approveTarget.id,
        payload: { status: "Published" },
      });
      setApproveTarget(null);
      refetch();
    } catch {
      // Toast handled by mutation hook
    }
  };

  // Xử lý xác nhận từ chối tin
  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    if (!rejectionReason.trim()) {
      setReasonError("Vui lòng nêu rõ lý do từ chối tin tuyển dụng.");
      return;
    }

    try {
      await moderateMutation.mutateAsync({
        id: rejectTarget.id,
        payload: {
          status: "Rejected",
          rejectionReason: rejectionReason.trim(),
        },
      });
      setRejectTarget(null);
      setRejectionReason("");
      setReasonError("");
      refetch();
    } catch {
      // Toast handled by mutation hook
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Tiêu đề trang & Thông tin */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            Kiểm duyệt tin tuyển dụng ({counts.PendingReview} tin chờ duyệt)
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Thẩm định mô tả công việc, mức thu nhập và nội dung yêu cầu trước khi xuất bản lên sàn SmartHire
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={RotateCw}
            iconSize={14}
            isLoading={isRefetching}
            onClick={() => refetch()}
            className="h-9! px-3! text-xs! font-medium!"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* 2. Bộ lọc trạng thái & Tìm kiếm */}
      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Tabs trạng thái */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 pb-2 lg:border-b-0 lg:pb-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = counts[tab.key] ?? 0;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                    isActive
                      ? "bg-secondary-light text-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {count < 10 && count > 0 ? `0${count}` : count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Ô tìm kiếm */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo chức danh hoặc tên công ty..."
              className="w-full rounded-xl border border-border bg-slate-50/50 py-2 pr-8 pl-9 text-xs text-slate-800 transition-colors outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* 3. Bảng dữ liệu Tin tuyển dụng hoặc Empty State dạng ảnh */}
        <div className="mt-4">
          {isLoading ? (
            <TableSkeleton />
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <img
                src={search ? EmptyState : EmptyStreet}
                alt="Không có dữ liệu"
                loading="lazy"
                className="h-64 w-auto sm:h-80"
              />
              <h3 className="mt-4 text-base font-bold text-text-main">
                {search
                  ? "Không tìm thấy tin tuyển dụng phù hợp"
                  : "Chưa có tin tuyển dụng nào"}
              </h3>
              <p className="mt-1 max-w-sm text-xs text-text-muted">
                {search
                  ? `Không có tin nào khớp với từ khóa "${search}". Vui lòng thử từ khóa khác.`
                  : activeTab === "PendingReview"
                    ? "Tất cả tin tuyển dụng mới đều đã được kiểm duyệt xong!"
                    : "Hiện tại danh mục này chưa có dữ liệu ghi nhận."}
              </p>
              {search && (
                <Button
                  variant="secondary"
                  onClick={handleClearSearch}
                  className="mt-4 h-9! px-4! text-xs! font-semibold!"
                >
                  Xóa tìm kiếm
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-2xs">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/80 bg-slate-50/50 font-semibold text-slate-600">
                    <tr>
                      <th className="w-16 px-4 py-3.5 text-center">#STT</th>
                      <th className="px-5 py-3.5">Vị trí & Doanh nghiệp</th>
                      <th className="px-4 py-3.5">Mức thu nhập</th>
                      <th className="px-4 py-3.5">Địa bàn</th>
                      <th className="px-4 py-3.5">Thời gian tạo</th>
                      <th className="px-4 py-3.5">Hạn nộp</th>
                      <th className="px-4 py-3.5">Trạng thái</th>
                      <th className="px-5 py-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map((job, index) => {
                      const displayIndex = (page - 1) * pageSize + index + 1;
                      const status = (job.status || "PendingReview").toUpperCase();
                      const isPending =
                        status === "PENDINGREVIEW" || status === "PENDING_APPROVAL";
                      const isPublished = status === "PUBLISHED";
                      const isRejected = status === "REJECTED";
                      const isExpired = status === "EXPIRED";
                      const isClosed = status === "CLOSED";

                      return (
                        <tr
                          key={job.id}
                          className="transition-colors hover:bg-slate-50/60"
                        >
                          {/* #STT */}
                          <td className="px-4 py-3.5 text-center font-semibold text-slate-500">
                            #{displayIndex < 10 ? `0${displayIndex}` : displayIndex}
                          </td>

                          {/* Vị trí & Doanh nghiệp */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <CompanyLogo
                                name={job.companyName}
                                logoUrl={job.companyLogoUrl}
                                size="sm"
                              />
                              <div className="min-w-0 max-w-xs">
                                <span className="block truncate font-semibold text-slate-800">
                                  {job.title}
                                </span>
                                <span className="block truncate text-xs text-slate-400">
                                  {job.companyName} • {job.vacancies} chỉ tiêu
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Thu nhập */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-semibold text-emerald-700">
                              {formatSalaryRange(
                                job.salaryMin,
                                job.salaryMax,
                                job.salaryNegotiable,
                              )}
                            </span>
                          </td>

                          {/* Địa bàn */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <MapPin className="size-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-40 font-medium">
                                {job.provinceName}
                              </span>
                            </div>
                          </td>

                          {/* Thời gian tạo */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col text-xs">
                              <span className="font-semibold text-slate-700">
                                {dayjs(job.createdAt).format("DD/MM/YYYY")}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {dayjs(job.createdAt).format("HH:mm")}
                              </span>
                            </div>
                          </td>

                          {/* Hạn nộp */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                            {job.deadline
                              ? dayjs(job.deadline).format("DD/MM/YYYY")
                              : "Không giới hạn"}
                          </td>

                          {/* Trạng thái */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                <Clock className="size-3" />
                                Chờ duyệt
                              </span>
                            )}
                            {isPublished && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                <CheckCircle2 className="size-3" />
                                Đã xuất bản
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                                <XCircle className="size-3" />
                                Bị từ chối
                              </span>
                            )}
                            {isExpired && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                Hết hạn
                              </span>
                            )}
                            {isClosed && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                Đã đóng
                              </span>
                            )}
                          </td>

                          {/* Thao tác (Button icon không label đồng bộ CompanyJoinRequestsTab) */}
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Button Xem chi tiết */}
                                <Button
                                  variant="secondary"
                                  icon={Eye}
                                  iconSize={15}
                                  title="Xem nội dung chi tiết"
                                  onClick={() => handleInspect(job)}
                                  className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-primary! shadow-none! ring-0! hover:bg-secondary-light/50! hover:text-primary-dark! disabled:text-text-muted! disabled:opacity-40!"
                                />
                                {/* Button Phê duyệt xuất bản */}
                                <Button
                                  variant="primary"
                                  icon={Check}
                                  iconSize={15}
                                  title="Phê duyệt xuất bản"
                                  onClick={() => setApproveTarget(job)}
                                  className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-emerald-600! shadow-none! ring-0! hover:bg-emerald-50! hover:text-emerald-700! disabled:text-text-muted! disabled:opacity-40!"
                                />
                                {/* Button Từ chối tin */}
                                <Button
                                  variant="secondary"
                                  icon={X}
                                  iconSize={15}
                                  title="Từ chối tin"
                                  onClick={() => {
                                    setRejectTarget(job);
                                    setRejectionReason("");
                                    setReasonError("");
                                  }}
                                  className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-rose-500! shadow-none! ring-0! hover:bg-rose-50! hover:text-rose-600! disabled:text-text-muted! disabled:opacity-40!"
                                />
                              </div>
                            ) : isPublished ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                  <CheckCircle2 className="size-3.5" />
                                  Đã duyệt
                                </span>
                                <Button
                                  variant="secondary"
                                  icon={Eye}
                                  iconSize={15}
                                  title="Xem chi tiết"
                                  onClick={() => handleInspect(job)}
                                  className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-primary! shadow-none! ring-0! hover:bg-secondary-light/50! hover:text-primary-dark!"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                                  <XCircle className="size-3.5" />
                                  Đã từ chối
                                </span>
                                <Button
                                  variant="secondary"
                                  icon={Eye}
                                  iconSize={15}
                                  title="Xem chi tiết"
                                  onClick={() => handleInspect(job)}
                                  className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-primary! shadow-none! ring-0! hover:bg-secondary-light/50! hover:text-primary-dark!"
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 4. Thanh phân trang đồng bộ */}
        {totalItems > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
            <span className="text-xs text-slate-500">
              Hiển thị{" "}
              <span className="font-semibold text-slate-700">
                {(page - 1) * pageSize + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(page * pageSize, totalItems)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-slate-700">{totalItems}</span>{" "}
              tin tuyển dụng
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                icon={ChevronLeft}
                iconSize={14}
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="h-8! px-2.5! text-xs! font-medium!"
              >
                Trước
              </Button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = pageNum === page;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        "size-8 rounded-lg text-xs font-semibold transition-colors",
                        isCurrent
                          ? "bg-primary text-white"
                          : "text-slate-600 hover:bg-slate-100",
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="secondary"
                icon={ChevronRight}
                iconPosition="right"
                iconSize={14}
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="h-8! px-2.5! text-xs! font-medium!"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Sheet thẩm định chi tiết tin tuyển dụng */}
      <JobModerationSheet
        job={inspectingJob}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setInspectingJob(null);
        }}
        onSuccess={() => refetch()}
      />

      {/* Modal xác nhận Duyệt xuất bản tin */}
      <Dialog
        open={Boolean(approveTarget)}
        onOpenChange={(open) => !open && setApproveTarget(null)}
      >
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Sparkles className="size-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Xác nhận phê duyệt xuất bản
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-slate-500">
              Tin tuyển dụng <strong className="text-slate-800">{approveTarget?.title}</strong> của{" "}
              <strong className="text-slate-800">{approveTarget?.companyName}</strong> sẽ được xuất bản
              công khai ngay lập tức lên sàn việc làm SmartHire.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setApproveTarget(null)}
              disabled={moderateMutation.isPending}
              className="h-9! px-4! text-xs! font-medium!"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon={Check}
              iconSize={14}
              isLoading={moderateMutation.isPending}
              onClick={handleConfirmApprove}
              className="h-9! bg-emerald-600! px-4! text-xs! font-semibold! text-white! hover:bg-emerald-700!"
            >
              Xác nhận xuất bản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal nhập lý do Từ chối tin tuyển dụng */}
      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <XCircle className="size-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Từ chối tin tuyển dụng
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-slate-500">
              Vui lòng nêu rõ lý do từ chối tin{" "}
              <strong className="text-slate-800">{rejectTarget?.title}</strong> để nhà tuyển dụng
              nắm được thông tin và chỉnh sửa lại.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-1.5">
            <label
              htmlFor="job-rejection-reason"
              className="text-xs font-semibold text-slate-800"
            >
              Lý do từ chối <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="job-rejection-reason"
              rows={4}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (reasonError) setReasonError("");
              }}
              placeholder="Ví dụ: Mô tả công việc không rõ ràng, yêu cầu chưa đầy đủ, hoặc mức lương không khớp..."
              className={cn(
                "w-full rounded-xl border border-border bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20 focus:outline-none",
                reasonError && "border-rose-400 focus:border-rose-500",
              )}
            />
            {reasonError && (
              <p className="text-[11px] font-medium text-rose-600">{reasonError}</p>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setRejectTarget(null)}
              disabled={moderateMutation.isPending}
              className="h-9! px-4! text-xs! font-medium!"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon={X}
              iconSize={14}
              isLoading={moderateMutation.isPending}
              onClick={handleConfirmReject}
              className="h-9! bg-rose-600! px-4! text-xs! font-semibold! text-white! hover:bg-rose-700!"
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
