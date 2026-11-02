import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  LibraryBig,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import { Button, TableSkeleton } from "@/components/common";
import { PATHS } from "@/constants/paths";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProvinces } from "@/hooks/queries/useCatalog";
import {
  useCompanyJobPostings,
  useUpdateJobPostingStatus,
} from "@/hooks/queries/useJob";
import { useCompanyStore } from "@/stores";
import type { JobPostingItem } from "@/types/job";
import { JobPostingsTable } from "./JobPostingsTable";
import { EmptyStreet } from "@/assets/images/decoration";

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "Published", label: "Đang nhận hồ sơ" },
  { value: "PendingReview", label: "Chờ duyệt" },
  { value: "Closed", label: "Đã đóng" },
  { value: "Expired", label: "Hết hạn" },
];

const WORK_MODE_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả hình thức" },
  { value: "Onsite", label: "Làm việc tại văn phòng (Onsite)" },
  { value: "Hybrid", label: "Linh hoạt kết hợp (Hybrid)" },
  { value: "Remote", label: "Làm việc từ xa (Remote)" },
];

export function RecruiterJobListPage() {
  const navigate = useNavigate();

  // 1. Lấy ngữ cảnh Workspace (Doanh nghiệp đang chọn) qua atomic selectors
  const activeCompanyId = useCompanyStore((s) => s.activeCompanyId);
  const activeCompany = useCompanyStore((s) => s.activeCompany);

  // 2. Data queries: Lấy trực tiếp tin tuyển dụng của công ty active (API 15 chuẩn Workspace)
  const { data: jobResponse, isLoading: isLoadingJobs } =
    useCompanyJobPostings(activeCompanyId);
  const { data: provinces = [] } = useProvinces();
  const updateStatusMutation = useUpdateJobPostingStatus();

  // 3. Local filter & pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [workModeFilter, setWorkModeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Điều chỉnh state khi chuyển đổi Workspace công ty (tránh cascading render effect)
  const [prevCompanyId, setPrevCompanyId] = useState(activeCompanyId);
  if (prevCompanyId !== activeCompanyId) {
    setPrevCompanyId(activeCompanyId);
    setCurrentPage(1);
  }

  // 4. Modal confirmation state
  const [jobToClose, setJobToClose] = useState<JobPostingItem | null>(null);
  const [isClosingSuccess, setIsClosingSuccess] = useState(false);

  // 5. Mappings for province and company logos
  const provinceMap = useMemo(() => {
    const map = new Map<string, string>();
    provinces.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [provinces]);

  const companyLogoMap = useMemo(() => {
    const map = new Map<string, string | null>();
    if (activeCompanyId && activeCompany?.logoUrl) {
      map.set(activeCompanyId, activeCompany.logoUrl);
    }
    return map;
  }, [activeCompanyId, activeCompany]);

  // Danh sách JD của công ty active
  const allJobs: JobPostingItem[] = useMemo(() => {
    return jobResponse?.items || [];
  }, [jobResponse]);

  // 6. Filter jobs (Purely derived in useMemo, bám sát các filter cục bộ)
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      // Status filter
      if (statusFilter !== "ALL") {
        const s = (job.status || "").toUpperCase();
        const target = statusFilter.toUpperCase();
        if (
          target === "PUBLISHED" &&
          s !== "PUBLISHED" &&
          s !== "OPEN" &&
          s !== "ACTIVE"
        )
          return false;
        if (
          target === "PENDINGREVIEW" &&
          s !== "PENDINGREVIEW" &&
          s !== "PENDING_REVIEW"
        )
          return false;
        if (target === "CLOSED" && s !== "CLOSED") return false;
        if (target === "EXPIRED" && s !== "EXPIRED") return false;
      }

      // WorkMode filter
      if (workModeFilter !== "ALL") {
        const wm = (job.workMode || "").toLowerCase();
        if (wm !== workModeFilter.toLowerCase()) return false;
      }

      // Keyword search (title & company name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (job.title || "").toLowerCase().includes(q);
        const compMatch = (job.companyName || job.company?.name || "")
          .toLowerCase()
          .includes(q);
        if (!titleMatch && !compMatch) return false;
      }

      return true;
    });
  }, [allJobs, statusFilter, workModeFilter, searchQuery]);

  // 7. Paginated jobs
  const totalItems = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  // Quick counters
  const openCount = allJobs.filter((j) => {
    const s = (j.status || "").toUpperCase();
    return s === "OPEN" || s === "PUBLISHED" || s === "ACTIVE";
  }).length;
  const closedCount = allJobs.filter(
    (j) => (j.status || "").toUpperCase() === "CLOSED",
  ).length;

  // Handlers
  const handleViewDetail = (job: JobPostingItem) => {
    navigate(PATHS.RECRUITER.JOB_DETAIL.replace(":id", job.id));
  };

  const handleEditJob = (job: JobPostingItem) => {
    navigate(PATHS.RECRUITER.EDIT_JOB.replace(":id", job.id));
  };

  const handleConfirmCloseJob = (job: JobPostingItem) => {
    setIsClosingSuccess(false);
    setJobToClose(job);
  };

  const handleExecuteClose = async () => {
    if (!jobToClose) return;
    try {
      await updateStatusMutation.mutateAsync({
        jobId: jobToClose.id,
        status: "CLOSED",
      });
      setIsClosingSuccess(true);
      setTimeout(() => {
        setJobToClose(null);
        setIsClosingSuccess(false);
      }, 1200);
    } catch {
      // Handled by react-query mutation error
    }
  };

  // Trường hợp Recruiter chưa chọn công ty hoặc chưa có công ty nào
  if (!activeCompanyId && !isLoadingJobs) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 p-8 text-center">
        <img
          src={EmptyStreet}
          alt="Chưa chọn doanh nghiệp làm việc"
          loading="lazy"
          className="h-80 w-auto md:h-100"
        />
        <h2 className="text-lg font-bold text-text-main">
          Chưa chọn doanh nghiệp làm việc
        </h2>
        <p className="max-w-md text-xs leading-relaxed text-text-muted">
          Vui lòng chọn doanh nghiệp tại thanh menu bên trái hoặc tạo hồ sơ
          doanh nghiệp mới để bắt đầu quản lý tin tuyển dụng.
        </p>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate(PATHS.RECRUITER.COMPANY_MANAGEMENT)}
          className="w-fit text-xs font-semibold"
        >
          Quản lý doanh nghiệp
        </Button>
      </section>
    );
  }

  return (
    <div className="min-h-full space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LibraryBig className="size-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-main sm:text-2xl">
              Danh sách tin tuyển dụng
            </h1>
          </div>
          {activeCompany ? (
            <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
              <span>Đang quản lý tin của:</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-text-main">
                {activeCompany.name}
              </span>
              {activeCompany.verificationStatus === "Verified" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <ShieldCheck className="size-3.5" />
                  Đã xác thực
                </span>
              )}
            </div>
          ) : (
            <p className="mt-1 text-xs text-text-muted sm:text-sm">
              Quản lý toàn bộ danh sách JD của công ty, theo dõi hồ sơ ứng tuyển
              và trạng thái tin
            </p>
          )}
        </div>

        <Button
          variant="primary"
          icon={Plus}
          iconSize={16}
          onClick={() => navigate(PATHS.RECRUITER.CREATE_JOB)}
          className="px-4! py-2! text-xs! font-semibold!"
        >
          Tạo tin mới
        </Button>
      </div>

      {/* 2. Quick Stat Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-text-muted">
            Tổng số tin
          </span>
          <p className="mt-1 text-xl font-bold text-text-main">
            {allJobs.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-emerald-600">
            Đang nhận hồ sơ
          </span>
          <p className="mt-1 text-xl font-bold text-emerald-700">{openCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Đã đóng</span>
          <p className="mt-1 text-xl font-bold text-slate-700">{closedCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-primary">Kết quả lọc</span>
          <p className="mt-1 text-xl font-bold text-primary">
            {filteredJobs.length}
          </p>
        </div>
      </div>

      {/* 3. Toolbar & Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề JD tuyển dụng..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-border bg-slate-50/50 py-2 pr-8 pl-9 text-xs text-text-main transition-colors placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters: Trạng thái & Hình thức */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 shadow-2xs">
            <Filter className="size-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Trạng thái:</span>
            <Select.Root
              items={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val || "ALL");
                setCurrentPage(1);
              }}
            >
              <Select.Trigger
                aria-label="Lọc theo trạng thái"
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
                      {STATUS_FILTER_OPTIONS.map((opt) => (
                        <Select.Item
                          key={opt.value}
                          value={opt.value}
                          className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-100 data-[state=checked]:font-semibold data-[state=checked]:text-primary"
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

          {/* WorkMode Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 shadow-2xs">
            <span className="text-xs text-slate-500">Hình thức:</span>
            <Select.Root
              items={WORK_MODE_FILTER_OPTIONS}
              value={workModeFilter}
              onValueChange={(val) => {
                setWorkModeFilter(val || "ALL");
                setCurrentPage(1);
              }}
            >
              <Select.Trigger
                aria-label="Lọc theo hình thức làm việc"
                className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <Select.Value />
                <Select.Icon className="text-slate-400 transition-transform duration-200 group-data-popup-open:rotate-180">
                  <ChevronDown className="size-3.5" />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
                  <Select.Popup className="z-50 min-w-48 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-md">
                    <Select.List>
                      {WORK_MODE_FILTER_OPTIONS.map((opt) => (
                        <Select.Item
                          key={opt.value}
                          value={opt.value}
                          className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-100 data-[state=checked]:font-semibold data-[state=checked]:text-primary"
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
      </div>

      {/* 4. Data Table */}
      {isLoadingJobs ? (
        <TableSkeleton />
      ) : (
        <JobPostingsTable
          data={paginatedJobs}
          provinceMap={provinceMap}
          companyLogoMap={companyLogoMap}
          onCloseJob={handleConfirmCloseJob}
          onEditJob={handleEditJob}
          onViewDetail={handleViewDetail}
          emptyMessage={
            searchQuery || statusFilter !== "ALL" || workModeFilter !== "ALL"
              ? "Không tìm thấy tin tuyển dụng nào phù hợp với bộ lọc."
              : `Doanh nghiệp "${activeCompany?.name || ""}" chưa có tin tuyển dụng nào. Hãy bắt đầu bằng cách bấm 'Tạo tin mới'!`
          }
        />
      )}

      {/* 5. Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-2xs sm:flex-row">
          <span className="text-xs text-slate-500">
            Hiển thị{" "}
            <span className="font-semibold text-slate-700">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-semibold text-slate-700">{totalItems}</span>{" "}
            tin tuyển dụng
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              icon={ChevronLeft}
              iconSize={14}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8! px-2.5! text-xs! font-medium!"
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8! px-2.5! text-xs! font-medium!"
            >
              Tiếp
            </Button>
          </div>
        </div>
      )}

      {/* 6. Modal Xác nhận Tắt / Đóng tin tuyển dụng */}
      <AlertDialog
        open={Boolean(jobToClose)}
        onOpenChange={(open) => {
          if (!open && !updateStatusMutation.isPending) {
            setJobToClose(null);
            setIsClosingSuccess(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đóng tin tuyển dụng</AlertDialogTitle>
            <AlertDialogDescription>
              {isClosingSuccess
                ? "Đã đóng tin tuyển dụng thành công. Trạng thái đã chuyển sang Đã đóng."
                : `Bạn có chắc chắn muốn đóng nhận hồ sơ cho vị trí "${jobToClose?.title}"? Sau khi đóng, ứng viên sẽ không thể gửi hồ sơ ứng tuyển vào vị trí này nữa.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!isClosingSuccess && (
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={updateStatusMutation.isPending}
                onClick={() => setJobToClose(null)}
              >
                Hủy bỏ
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={updateStatusMutation.isPending}
                onClick={handleExecuteClose}
              >
                {updateStatusMutation.isPending ? "Đang đóng tin..." : "Xác nhận đóng tin"}
              </AlertDialogAction>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
export default RecruiterJobListPage;
