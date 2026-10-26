import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MessageSquare,
  Search,
  UserRoundGroup,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import { Button, TableSkeleton } from "@/components/common";
import { PATHS } from "@/constants/paths";
import { useMyCompanies } from "@/hooks/queries/useCompany";
import {
  useRecruiterAllApplications,
  useRecruiterJobPostings,
  useUpdateApplicationStatus,
} from "@/hooks/queries/useJob";
import { useCompanyStore } from "@/stores";
import type {
  JobPostingItem,
  RecruiterCandidateApplicationItem,
  UpdateJobApplicationStatus,
} from "@/types/job";
import {
  APPLICATION_STATUS_CONFIG,
  APPLICATION_STATUS_OPTIONS,
  resolveCandidateProfile,
} from "@/types/application";
import { CandidateTable } from "./CandidateTable";

interface PendingStatusChange {
  app: RecruiterCandidateApplicationItem;
  fromStatus: string;
  toStatus: UpdateJobApplicationStatus;
}

export function RecruiterCandidateListPage() {
  const navigate = useNavigate();
  const { activeCompanyId, setActiveCompanyId } = useCompanyStore();

  // 1. Data queries: Lấy công ty của recruiter -> Lấy jobs -> Lấy toàn bộ applications
  const { data: myCompanies = [], isLoading: isLoadingCompanies } =
    useMyCompanies();

  const myCompanyIdsList = useMemo(
    () => myCompanies.map((c) => c.id),
    [myCompanies],
  );

  const { data: jobResponse, isLoading: isLoadingJobs } =
    useRecruiterJobPostings(myCompanyIdsList);

  const allJobs: JobPostingItem[] = useMemo(() => {
    return jobResponse?.items || [];
  }, [jobResponse]);

  const { data: allApplications = [], isLoading: isLoadingApplications } =
    useRecruiterAllApplications(allJobs);

  const updateStatusMutation = useUpdateApplicationStatus();

  const isLoading =
    isLoadingCompanies || isLoadingJobs || isLoadingApplications;

  // 2. Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
    return activeCompanyId || "ALL";
  });
  const [selectedJobId, setSelectedJobId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // 3. Modal states
  const [selectedLetterApp, setSelectedLetterApp] =
    useState<RecruiterCandidateApplicationItem | null>(null);
  const [pendingChange, setPendingChange] =
    useState<PendingStatusChange | null>(null);
  const [transitionNote, setTransitionNote] = useState("");
  const [isSubmittingTransition, setIsSubmittingTransition] = useState(false);

  // Options cho bộ lọc công ty
  const companyFilterOptions = useMemo(() => {
    const opts = [{ value: "ALL", label: "Tất cả công ty của tôi" }];
    myCompanies.forEach((c) => {
      opts.push({ value: c.id, label: c.name });
    });
    return opts;
  }, [myCompanies]);

  // Options cho bộ lọc Job (lọc theo công ty được chọn nếu có)
  const jobFilterOptions = useMemo(() => {
    const opts = [{ value: "ALL", label: "Tất cả vị trí tuyển dụng" }];
    const targetJobs =
      selectedCompanyId === "ALL"
        ? allJobs
        : allJobs.filter((j) => j.companyId === selectedCompanyId);

    targetJobs.forEach((j) => {
      opts.push({ value: j.id, label: j.title });
    });
    return opts;
  }, [allJobs, selectedCompanyId]);

  // 4. Lọc danh sách ứng viên (useMemo)
  const filteredApplications = useMemo(() => {
    return allApplications.filter((app) => {
      // Lọc theo công ty
      if (selectedCompanyId !== "ALL" && app.companyId !== selectedCompanyId) {
        return false;
      }

      // Lọc theo Job
      if (selectedJobId !== "ALL" && app.jobId !== selectedJobId) {
        return false;
      }

      // Lọc theo trạng thái hồ sơ
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
        if (statusFilter === "HIRED" && s !== "HIRED" && s !== "ACCEPTED") {
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

      // Tìm kiếm theo từ khóa (Tên ứng viên, Email, Tiêu đề Job)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const profile = resolveCandidateProfile(app);
        const nameMatch = profile.name.toLowerCase().includes(q);
        const emailMatch = profile.email.toLowerCase().includes(q);
        const jobMatch = (app.jobTitle || "").toLowerCase().includes(q);
        const letterMatch = (app.coverLetter || "").toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !jobMatch && !letterMatch) {
          return false;
        }
      }

      return true;
    });
  }, [
    allApplications,
    selectedCompanyId,
    selectedJobId,
    statusFilter,
    searchQuery,
  ]);

  // 5. Phân trang
  const totalItems = filteredApplications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, currentPage, pageSize]);

  // Quick stat counters
  const reviewingCount = allApplications.filter(
    (a) => (a.status || "").toUpperCase() === "REVIEWING",
  ).length;
  const interviewCount = allApplications.filter((a) => {
    const s = (a.status || "").toUpperCase();
    return s === "INTERVIEW" || s === "INTERVIEWING";
  }).length;
  const hiredCount = allApplications.filter((a) => {
    const s = (a.status || "").toUpperCase();
    return s === "HIRED" || s === "ACCEPTED";
  }).length;

  // Handlers
  const handleOpenConfirmTransition = (
    app: RecruiterCandidateApplicationItem,
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
      await updateStatusMutation.mutateAsync({
        applicationId: pendingChange.app.id,
        status: pendingChange.toStatus,
        note: transitionNote,
      });
      setPendingChange(null);
      setTransitionNote("");
    } catch {
      // Error handled by mutation toast
    } finally {
      setIsSubmittingTransition(false);
    }
  };

  return (
    <div className="min-h-full space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserRoundGroup className="size-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-main sm:text-2xl">
              Danh sách Ứng viên
            </h1>
          </div>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            Theo dõi toàn bộ hồ sơ ứng tuyển, duyệt tiến trình phỏng vấn và quản
            lý ứng viên của công ty
          </p>
        </div>
      </div>

      {/* 2. 4 Quick Stat Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-text-muted">
            Tổng số ứng viên
          </span>
          <p className="mt-1 text-xl font-bold text-text-main">
            {allApplications.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-sky-600">Đang xem xét</span>
          <p className="mt-1 text-xl font-bold text-sky-700">
            {reviewingCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-amber-600">
            Mời phỏng vấn
          </span>
          <p className="mt-1 text-xl font-bold text-amber-700">
            {interviewCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-emerald-600">
            Đã tuyển dụng
          </span>
          <p className="mt-1 text-xl font-bold text-emerald-700">
            {hiredCount}
          </p>
        </div>
      </div>

      {/* 3. Toolbar & Bộ lọc đa chiều */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên ứng viên, email, hoặc vị trí tuyển dụng..."
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

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bộ lọc Công ty */}
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
                  setSelectedJobId("ALL"); // Reset job filter khi đổi cty
                  setCurrentPage(1);
                }}
              >
                <Select.Trigger
                  aria-label="Lọc theo công ty"
                  className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-800 focus:outline-none"
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

          {/* Bộ lọc Vị trí tuyển dụng (JD) */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 shadow-2xs">
            <Briefcase className="size-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Vị trí:</span>
            <Select.Root
              items={jobFilterOptions}
              value={selectedJobId}
              onValueChange={(val) => {
                setSelectedJobId(val || "ALL");
                setCurrentPage(1);
              }}
            >
              <Select.Trigger
                aria-label="Lọc theo tin tuyển dụng"
                className="flex max-w-44 cursor-pointer items-center gap-1 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <span className="truncate">
                  {jobFilterOptions.find((o) => o.value === selectedJobId)
                    ?.label || "Tất cả vị trí"}
                </span>
                <Select.Icon className="shrink-0 text-slate-400 transition-transform duration-200 group-data-popup-open:rotate-180">
                  <ChevronDown className="size-3.5" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
                  <Select.Popup className="z-50 max-h-64 min-w-56 overflow-y-auto rounded-xl border border-border bg-white p-1 shadow-md">
                    <Select.List>
                      {jobFilterOptions.map((opt) => (
                        <Select.Item
                          key={opt.value}
                          value={opt.value}
                          className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-100 data-[state=checked]:font-semibold data-[state=checked]:text-primary"
                        >
                          <Select.ItemText>{opt.label}</Select.ItemText>
                          <Select.ItemIndicator
                            animation="pop"
                            className="ml-2 shrink-0 text-xs text-primary"
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

          {/* Bộ lọc Trạng thái hồ sơ */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 shadow-2xs">
            <Filter className="size-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Trạng thái:</span>
            <Select.Root
              items={APPLICATION_STATUS_OPTIONS}
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
                  <Select.Popup className="z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-md">
                    <Select.List>
                      {APPLICATION_STATUS_OPTIONS.map(
                        (opt: { value: string; label: string }) => (
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
                        ),
                      )}
                    </Select.List>
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </div>
        </div>
      </div>

      {/* 4. DataTable ứng viên */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="space-y-4">
          <CandidateTable
            data={paginatedApplications}
            onReadCoverLetter={(app) => setSelectedLetterApp(app)}
            onRequestChangeStatus={handleOpenConfirmTransition}
            onViewJobDetail={(jobId) =>
              navigate(PATHS.RECRUITER.JOB_DETAIL.replace(":id", jobId))
            }
            isUpdatingStatus={updateStatusMutation.isPending}
            emptyMessage={
              searchQuery ||
              selectedJobId !== "ALL" ||
              statusFilter !== "ALL" ||
              selectedCompanyId !== "ALL"
                ? "Không tìm thấy hồ sơ ứng viên nào khớp với bộ lọc."
                : "Chưa có ứng viên nào nộp hồ sơ vào các tin tuyển dụng của bạn."
            }
          />

          {/* 5. Phân trang */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 px-1 py-2 sm:flex-row">
              <span className="text-xs text-slate-500">
                Hiển thị{" "}
                <strong className="text-slate-700">
                  {(currentPage - 1) * pageSize + 1}
                </strong>{" "}
                -{" "}
                <strong className="text-slate-700">
                  {Math.min(currentPage * pageSize, totalItems)}
                </strong>{" "}
                trên tổng số{" "}
                <strong className="text-slate-700">{totalItems}</strong> hồ sơ
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="size-8! p-0! text-xs!"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    const isCurrent = page === currentPage;
                    return (
                      <Button
                        key={page}
                        variant={isCurrent ? "primary" : "secondary"}
                        onClick={() => setCurrentPage(page)}
                        className={`size-8! p-0! text-xs! font-semibold! ${
                          isCurrent
                            ? "bg-primary text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  },
                )}

                <Button
                  variant="secondary"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="size-8! p-0! text-xs!"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Modal Đọc toàn văn Thư giới thiệu (Cover Letter) */}
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
                    {resolveCandidateProfile(selectedLetterApp).name} • Ứng
                    tuyển: {selectedLetterApp.jobTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLetterApp(null)}
                className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs leading-relaxed whitespace-pre-line text-slate-700 sm:text-sm">
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

      {/* 7. Modal Xác nhận chuyển trạng thái hồ sơ theo State Machine */}
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
                className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
                  <span className="text-slate-500">Vị trí:</span>
                  <span className="font-medium text-slate-700">
                    {pendingChange.app.jobTitle}
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
                    APPLICATION_STATUS_CONFIG[pendingChange.fromStatus]
                      ?.badgeClass ||
                    "border-slate-200 bg-slate-100 text-slate-700"
                  }`}
                >
                  {APPLICATION_STATUS_CONFIG[pendingChange.fromStatus]?.label ||
                    pendingChange.fromStatus}
                </span>

                <ArrowRight className="size-4 text-slate-400" />

                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    APPLICATION_STATUS_CONFIG[pendingChange.toStatus]
                      ?.badgeClass ||
                    "border-primary/20 bg-primary/10 text-primary"
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
                  Lưu lại lý do hoặc thông tin cho vòng xử lý này (tối đa 2,000
                  ký tự).
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
                {isSubmittingTransition
                  ? "Đang cập nhật..."
                  : "Xác nhận chuyển"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterCandidateListPage;
