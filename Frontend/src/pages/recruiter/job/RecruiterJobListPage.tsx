import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  LibraryBig,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import Button from "@/components/Button";
import { PATHS } from "@/constants/paths";
import { useProvinces } from "@/hooks/queries/useCatalog";
import { useMyCompanies } from "@/hooks/queries/useCompany";
import {
  useJobPostings,
  useUpdateJobPostingStatus,
} from "@/hooks/queries/useJob";
import { useCompanyStore } from "@/stores";
import type { JobPostingItem } from "@/types/job";
import { JobPostingsTable } from "./JobPostingsTable";

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "OPEN", label: "Đang nhận hồ sơ" },
  { value: "PENDING_REVIEW", label: "Chờ duyệt" },
  { value: "PAUSED", label: "Tạm dừng" },
  { value: "CLOSED", label: "Đã đóng" },
  { value: "EXPIRED", label: "Hết hạn" },
];

const WORK_MODE_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả hình thức" },
  { value: "Onsite", label: "Làm việc tại văn phòng (Onsite)" },
  { value: "Hybrid", label: "Linh hoạt kết hợp (Hybrid)" },
  { value: "Remote", label: "Làm việc từ xa (Remote)" },
];

export function RecruiterJobListPage() {
  const navigate = useNavigate();
  const { activeCompanyId, setActiveCompanyId } = useCompanyStore();

  // 1. Data queries
  const { data: jobResponse, isLoading: isLoadingJobs } = useJobPostings();
  const { data: provinces = [] } = useProvinces();
  const { data: myCompanies = [], isLoading: isLoadingCompanies } = useMyCompanies();
  const updateStatusMutation = useUpdateJobPostingStatus();

  const isLoading = isLoadingJobs || isLoadingCompanies;

  // 2. Local filter & pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [workModeFilter, setWorkModeFilter] = useState("ALL");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
    return activeCompanyId || "ALL";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // 3. Modal confirmation state
  const [jobToClose, setJobToClose] = useState<JobPostingItem | null>(null);
  const [isClosingSuccess, setIsClosingSuccess] = useState(false);

  // 4. Mappings for province and company logos
  const provinceMap = useMemo(() => {
    const map = new Map<string, string>();
    provinces.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [provinces]);

  const companyLogoMap = useMemo(() => {
    const map = new Map<string, string | null>();
    myCompanies.forEach((c) => map.set(c.id, c.logoUrl));
    return map;
  }, [myCompanies]);

  // 5. Dọn đường cho Company Switcher: Lọc chỉ những công ty Recruiter thuộc về
  const myCompanyIds = useMemo(() => {
    return new Set(myCompanies.map((c) => c.id));
  }, [myCompanies]);

  const companyFilterOptions = useMemo(() => {
    const opts = [{ value: "ALL", label: "Tất cả công ty của tôi" }];
    myCompanies.forEach((c) => {
      opts.push({ value: c.id, label: c.name });
    });
    return opts;
  }, [myCompanies]);

  // Chỉ lấy những JD thuộc về công ty mà recruiter này có quyền quản lý
  const allJobs: JobPostingItem[] = useMemo(() => {
    const items = jobResponse?.items || [];
    if (myCompanyIds.size === 0) return [];
    return items.filter((job) => myCompanyIds.has(job.companyId));
  }, [jobResponse, myCompanyIds]);

  // 6. Filter jobs (Purely derived in useMemo)
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      // Company filter
      if (selectedCompanyId !== "ALL") {
        if (job.companyId !== selectedCompanyId) return false;
      }

      // Status filter
      if (statusFilter !== "ALL") {
        const s = (job.status || "").toUpperCase();
        if (
          statusFilter === "OPEN" &&
          s !== "OPEN" &&
          s !== "PUBLISHED" &&
          s !== "ACTIVE"
        ) {
          return false;
        }
        if (statusFilter === "CLOSED" && s !== "CLOSED") return false;
        if (statusFilter === "PAUSED" && s !== "PAUSED") return false;
        if (statusFilter === "EXPIRED" && s !== "EXPIRED") return false;
        if (
          statusFilter === "PENDING_REVIEW" &&
          s !== "PENDING_REVIEW" &&
          s !== "PENDINGREVIEW"
        ) {
          return false;
        }
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
        const compMatch = (job.companyName || "").toLowerCase().includes(q);
        if (!titleMatch && !compMatch) return false;
      }

      return true;
    });
  }, [allJobs, selectedCompanyId, statusFilter, workModeFilter, searchQuery]);

  // 7. Paginated jobs (Purely derived in useMemo)
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
              Danh sách tin tuyển dụng (JD)
            </h1>
          </div>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            Quản lý toàn bộ danh sách JD của công ty, theo dõi hồ sơ ứng tuyển
            và trạng thái tin
          </p>
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
            placeholder="Tìm kiếm theo tiêu đề JD hoặc tên công ty..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page on user typing
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

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Company Filter (Dọn đường cho HR switch công ty) */}
          {myCompanies.length > 1 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 shadow-2xs">
              <Building2 className="size-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Công ty:</span>
              <Select.Root
                items={companyFilterOptions}
                value={selectedCompanyId}
                onValueChange={(val) => {
                  const nextVal = val || "ALL";
                  setSelectedCompanyId(nextVal);
                  setActiveCompanyId(nextVal === "ALL" ? null : nextVal);
                  setCurrentPage(1);
                }}
              >
                <Select.Trigger
                  aria-label="Lọc theo công ty"
                  className="flex max-w-44 cursor-pointer items-center gap-1 truncate text-xs font-semibold text-slate-800 focus:outline-none"
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
                        {companyFilterOptions.map((opt) => (
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
          )}

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
      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-slate-50/50" />
      ) : (
        <JobPostingsTable
          data={paginatedJobs}
          provinceMap={provinceMap}
          companyLogoMap={companyLogoMap}
          onCloseJob={handleConfirmCloseJob}
          onEditJob={handleEditJob}
          onViewDetail={handleViewDetail}
          emptyMessage={
            myCompanies.length === 0
              ? "Bạn chưa tham gia công ty nào. Vui lòng tạo hồ sơ công ty hoặc chấp nhận lời mời để quản lý tin tuyển dụng."
              : searchQuery ||
                  statusFilter !== "ALL" ||
                  workModeFilter !== "ALL" ||
                  selectedCompanyId !== "ALL"
                ? "Không tìm thấy tin tuyển dụng nào phù hợp với bộ lọc."
                : "Công ty của bạn chưa có tin tuyển dụng nào. Hãy bắt đầu bằng cách bấm 'Tạo tin mới'!"
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
      {jobToClose && (
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
                  Thao tác này sẽ dừng nhận hồ sơ ứng tuyển
                </p>
              </div>
            </div>

            {isClosingSuccess ? (
              <div className="my-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
                ✓ Đã đóng tin tuyển dụng thành công! Trạng thái đã chuyển sang
                Đã đóng.
              </div>
            ) : (
              <p className="my-3 text-xs leading-relaxed text-slate-600">
                Bạn có chắc chắn muốn đóng nhận hồ sơ cho vị trí{" "}
                <strong className="font-semibold text-slate-900">
                  "{jobToClose.title}"
                </strong>
                ? Sau khi đóng, ứng viên sẽ không thể gửi hồ sơ ứng tuyển vào vị
                trí này nữa.
              </p>
            )}

            {!isClosingSuccess && (
              <div className="mt-6 flex items-center justify-end gap-2.5">
                <Button
                  variant="secondary"
                  disabled={updateStatusMutation.isPending}
                  onClick={() => setJobToClose(null)}
                  className="px-4! py-2! text-xs! font-medium!"
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="primary"
                  isLoading={updateStatusMutation.isPending}
                  onClick={handleExecuteClose}
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
