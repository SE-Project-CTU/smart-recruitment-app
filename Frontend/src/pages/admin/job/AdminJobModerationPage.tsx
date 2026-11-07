import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  RotateCcw,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";

import { Button, TableSkeleton } from "@/components/common";
import { Input } from "@/components/ui/input";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { JobModerationSheet } from "./JobModerationSheet";
import { useAdminJobPostings } from "@/hooks/queries/useAdmin";
import type { AdminJobPostingItem, AdminJobModerationStatus } from "@/types/admin";
import { formatSalaryRange } from "@/utils/jobHelpers";
import { cn } from "@/lib/utils";

dayjs.locale("vi");

const TABS = [
  { id: "PendingReview", label: "Chờ phê duyệt", icon: Clock },
  { id: "Published", label: "Đã xuất bản", icon: CheckCircle2 },
  { id: "Rejected", label: "Bị từ chối", icon: XCircle },
  { id: "All", label: "Tất cả tin", icon: Briefcase },
] as const;

export default function AdminJobModerationPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc params từ URL
  const activeTab = (searchParams.get("tab") || "PendingReview") as string;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const pageSize = 10;

  // Local state cho search input
  const [searchInput, setSearchInput] = useState(search);

  // Tin đang được mở trong Sheet kiểm duyệt
  const [inspectingJob, setInspectingJob] =
    useState<AdminJobPostingItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const handleTabChange = (tabId: string) => {
    updateParams({ tab: tabId, page: "1" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim(), page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateParams({ page: newPage.toString() });
  };

  const handleInspect = (job: AdminJobPostingItem) => {
    setInspectingJob(job);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header Trang */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">
            Kiểm duyệt tin tuyển dụng
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Thẩm định mô tả, mức lương và nội dung công việc để đảm bảo trải nghiệm tin cậy cho ứng viên.
          </p>
        </div>

        <Button
          variant="outline"
          icon={RotateCcw}
          isLoading={isRefetching}
          onClick={() => refetch()}
          className="h-9 self-start rounded-xl px-3.5 text-xs font-semibold sm:self-auto"
        >
          Làm mới
        </Button>
      </div>

      {/* 2. Tabs trạng thái & Toolbar lọc */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-3">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-muted hover:bg-bg hover:text-text-main",
                )}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo chức danh, công việc hoặc doanh nghiệp..."
              className="h-10 rounded-xl pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              className="h-10 rounded-xl px-4 text-xs font-semibold"
            >
              Tìm kiếm
            </Button>
            {search && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput("");
                  updateParams({ search: null, page: "1" });
                }}
                className="h-10 rounded-xl px-3 text-xs"
              >
                Xóa tìm kiếm
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* 3. Bảng Dữ liệu Tin tuyển dụng */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Briefcase className="size-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-text-main">
              Không tìm thấy tin tuyển dụng nào
            </h3>
            <p className="mt-1 max-w-sm text-xs text-text-muted">
              {search
                ? `Không có tin tuyển dụng nào khớp với từ khóa "${search}".`
                : "Hiện tại không có tin tuyển dụng nào thuộc trạng thái này."}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/80 bg-slate-50/60 font-semibold text-text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Vị trí & Doanh nghiệp</th>
                  <th className="px-4 py-3.5">Mức thu nhập</th>
                  <th className="px-4 py-3.5">Địa bàn</th>
                  <th className="px-4 py-3.5">Chỉ tiêu</th>
                  <th className="px-4 py-3.5">Hạn nộp</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {jobs.map((job) => {
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
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      {/* Vị trí & Doanh nghiệp */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <CompanyLogo
                            name={job.companyName}
                            logoUrl={job.companyLogoUrl}
                            size="sm"
                          />
                          <div className="min-w-0 max-w-xs">
                            <span className="block truncate font-bold text-text-main">
                              {job.title}
                            </span>
                            <span className="block truncate text-[11px] text-text-muted">
                              {job.companyName}
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
                        <div className="flex items-center gap-1.5 text-text-main">
                          <MapPin className="size-3 text-text-muted shrink-0" />
                          <span className="truncate max-w-40">
                            {job.provinceName}
                          </span>
                        </div>
                      </td>

                      {/* Chỉ tiêu */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-medium text-text-main">
                          {job.vacancies} người
                        </span>
                      </td>

                      {/* Hạn nộp */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-text-muted">
                        {job.deadline
                          ? dayjs(job.deadline).format("DD/MM/YYYY")
                          : "Không giới hạn"}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                            <Clock className="size-3" />
                            Chờ duyệt
                          </span>
                        )}
                        {isPublished && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="size-3" />
                            Đã xuất bản
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                            <XCircle className="size-3" />
                            Bị từ chối
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                            Hết hạn
                          </span>
                        )}
                        {isClosed && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                            Đã đóng
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          icon={Eye}
                          onClick={() => handleInspect(job)}
                          className={cn(
                            "h-8 rounded-lg px-3 text-xs font-semibold",
                            isPending
                              ? "border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100"
                              : "text-text-main hover:bg-bg",
                          )}
                        >
                          {isPending ? "Kiểm duyệt" : "Xem chi tiết"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Thanh phân trang */}
        {meta && meta.totalItems > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border/70 p-4 sm:flex-row">
            <span className="text-xs text-text-muted">
              Hiển thị{" "}
              <strong className="font-semibold text-text-main">
                {(page - 1) * pageSize + 1} -{" "}
                {Math.min(page * pageSize, meta.totalItems)}
              </strong>{" "}
              trong tổng số{" "}
              <strong className="font-semibold text-text-main">
                {meta.totalItems}
              </strong>{" "}
              tin tuyển dụng
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                icon={ChevronLeft}
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="size-8 p-0"
                aria-label="Trang trước"
              />
              <span className="px-2 text-xs font-semibold text-text-main">
                Trang {page} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                icon={ChevronRight}
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="size-8 p-0"
                aria-label="Trang sau"
              />
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
    </div>
  );
}
