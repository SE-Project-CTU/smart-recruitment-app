import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRoundGroup,
  X,
} from "lucide-react";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import { Button, TableSkeleton } from "@/components/common";
import { PATHS } from "@/constants/paths";
import {
  useCompanyJobPostings,
  useRecruiterAllApplications,
  useUpdateApplicationStatus,
} from "@/hooks/queries/useJob";
import { useCompanyStore } from "@/stores";
import type { JobPostingItem } from "@/types/job";
import {
  APPLICATION_STATUS_CONFIG,
  resolveCandidateProfile,
  type RecruiterCandidateApplicationItem,
  type UpdateJobApplicationStatus,
} from "@/types/application";
import { CandidateTable } from "./CandidateTable";
import { ApplicationCvPreviewDialog } from "./ApplicationCvPreviewDialog";
import { EmptyStreet } from "@/assets/images/decoration";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PendingStatusChange {
  app: RecruiterCandidateApplicationItem;
  fromStatus: string;
  toStatus: UpdateJobApplicationStatus;
}

export function RecruiterCandidateListPage() {
  const navigate = useNavigate();

  // 1. Lấy thông tin Workspace (Doanh nghiệp đang chọn) qua atomic selectors
  const activeCompanyId = useCompanyStore((s) => s.activeCompanyId);
  const activeCompany = useCompanyStore((s) => s.activeCompany);

  // 2. Data queries: Lấy trực tiếp JD và Ứng viên của công ty active (API 15 chuẩn Workspace)
  const { data: jobResponse, isLoading: isLoadingJobs } =
    useCompanyJobPostings(activeCompanyId);

  const allJobs: JobPostingItem[] = useMemo(() => {
    return jobResponse?.items || [];
  }, [jobResponse]);

  const {
    data: allApplications = [],
    isLoading: isLoadingApplications,
    isError: isApplicationsError,
    refetch: refetchApplications,
  } = useRecruiterAllApplications(activeCompanyId);

  const updateStatusMutation = useUpdateApplicationStatus();

  const isLoading = isLoadingJobs || isLoadingApplications;

  // 3. Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Điều chỉnh state khi chuyển đổi Workspace công ty (tránh cascading render effect)
  const [prevCompanyId, setPrevCompanyId] = useState(activeCompanyId);
  if (prevCompanyId !== activeCompanyId) {
    setPrevCompanyId(activeCompanyId);
    setSelectedJobId("ALL");
    setCurrentPage(1);
  }

  // 4. Modal states
  const [selectedLetterApp, setSelectedLetterApp] =
    useState<RecruiterCandidateApplicationItem | null>(null);
  const [selectedCvApp, setSelectedCvApp] =
    useState<RecruiterCandidateApplicationItem | null>(null);
  const [pendingChange, setPendingChange] =
    useState<PendingStatusChange | null>(null);
  const [transitionNote, setTransitionNote] = useState("");
  const [isSubmittingTransition, setIsSubmittingTransition] = useState(false);

  // Options cho bộ lọc Job thuộc công ty active
  const jobFilterOptions = useMemo(() => {
    const opts = [{ value: "ALL", label: "Tất cả vị trí tuyển dụng" }];
    allJobs.forEach((j) => {
      opts.push({ value: j.id, label: j.title });
    });
    return opts;
  }, [allJobs]);

  // 5. Lọc danh sách ứng viên (useMemo an toàn với đầy đủ deps)
  const filteredApplications = useMemo(() => {
    return allApplications.filter((app) => {
      // Lọc theo Job
      if (selectedJobId !== "ALL" && app.jobId !== selectedJobId) {
        return false;
      }

      // Lọc theo trạng thái hồ sơ
      if (statusFilter !== "ALL") {
        const s = (app.status || "").toUpperCase();
        const sf = statusFilter.toUpperCase();

        if (
          (sf === "SUBMITTED" || sf === "APPLIED" || sf === "RECEIVED") &&
          s !== "SUBMITTED" &&
          s !== "APPLIED" &&
          s !== "RECEIVED"
        ) {
          return false;
        }
        if (
          (sf === "INTERVIEW" || sf === "INTERVIEWING") &&
          s !== "INTERVIEW" &&
          s !== "INTERVIEWING"
        ) {
          return false;
        }
        if (
          (sf === "HIRED" || sf === "ACCEPTED") &&
          s !== "HIRED" &&
          s !== "ACCEPTED"
        ) {
          return false;
        }
        if (
          sf !== "SUBMITTED" &&
          sf !== "APPLIED" &&
          sf !== "RECEIVED" &&
          sf !== "INTERVIEW" &&
          sf !== "INTERVIEWING" &&
          sf !== "HIRED" &&
          sf !== "ACCEPTED" &&
          s !== sf
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
  }, [allApplications, selectedJobId, statusFilter, searchQuery]);

  // 6. Phân trang
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

  // Trường hợp Recruiter chưa chọn công ty hoặc chưa có công ty nào
  if (!activeCompanyId && !isLoading) {
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
          Vui lòng chọn doanh nghiệp tại menu bên trái hoặc tạo hồ sơ doanh
          nghiệp mới để theo dõi danh sách ứng viên.
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
          {activeCompany ? (
            <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
              <span>Đang quản lý hồ sơ của:</span>
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
              Theo dõi toàn bộ hồ sơ ứng tuyển, duyệt tiến trình phỏng vấn và
              quản lý ứng viên của công ty
            </p>
          )}
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

        {/* Dropdown Filters: Vị trí & Trạng thái */}
        <div className="flex flex-wrap items-center gap-2">
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
                <Select.Value />
                <Select.Icon className="text-slate-400 transition-transform duration-200 group-data-popup-open:rotate-180">
                  <ChevronDown className="size-3.5" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
                  <Select.Popup className="z-50 min-w-48 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-md">
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

          {/* Bộ lọc Trạng thái */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 shadow-2xs">
            <Filter className="size-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Trạng thái:</span>
            <Select.Root
              items={[
                { value: "ALL", label: "Tất cả trạng thái" },
                { value: "SUBMITTED", label: "Mới ứng tuyển" },
                { value: "REVIEWING", label: "Đang xem xét" },
                { value: "INTERVIEW", label: "Mời phỏng vấn" },
                { value: "HIRED", label: "Đã tuyển dụng" },
                { value: "REJECTED", label: "Đã từ chối" },
              ]}
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val || "ALL");
                setCurrentPage(1);
              }}
            >
              <Select.Trigger
                aria-label="Lọc theo trạng thái ứng viên"
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
                      {[
                        { value: "ALL", label: "Tất cả trạng thái" },
                        { value: "SUBMITTED", label: "Mới ứng tuyển" },
                        { value: "REVIEWING", label: "Đang xem xét" },
                        { value: "INTERVIEW", label: "Mời phỏng vấn" },
                        { value: "HIRED", label: "Đã tuyển dụng" },
                        { value: "REJECTED", label: "Đã từ chối" },
                      ].map((opt) => (
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

      {/* 4. Table Ứng viên */}
      {isLoading ? (
        <TableSkeleton />
      ) : isApplicationsError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white py-14 text-center">
          <p className="text-sm font-semibold text-rose-600">
            Không thể tải danh sách ứng viên
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Vui lòng thử lại sau vài giây
          </p>
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => refetchApplications()}
            className="mt-3 text-xs"
          >
            Tải lại
          </Button>
        </div>
      ) : (
        <CandidateTable
          data={paginatedApplications}
          onReadCoverLetter={(app: RecruiterCandidateApplicationItem) =>
            setSelectedLetterApp(app)
          }
          onRequestChangeStatus={handleOpenConfirmTransition}
          onViewJobDetail={(jobId: string) =>
            navigate(PATHS.RECRUITER.JOB_DETAIL.replace(":id", jobId))
          }
          onPreviewCv={setSelectedCvApp}
          isUpdatingStatus={updateStatusMutation.isPending}
          emptyMessage={
            searchQuery || selectedJobId !== "ALL" || statusFilter !== "ALL"
              ? "Không tìm thấy hồ sơ ứng viên nào phù hợp với bộ lọc."
              : `Doanh nghiệp "${activeCompany?.name || ""}" hiện chưa có hồ sơ ứng tuyển nào.`
          }
        />
      )}

      {/* 5. Pagination Bar */}
      <ApplicationCvPreviewDialog
        application={selectedCvApp}
        onClose={() => setSelectedCvApp(null)}
      />
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
            ứng viên
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

      {/* 6. Modal Xem Thư Giới Thiệu (Cover Letter) */}
      <Dialog
        open={Boolean(selectedLetterApp)}
        onOpenChange={(open) => {
          if (!open) setSelectedLetterApp(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thư giới thiệu của ứng viên</DialogTitle>
            <DialogDescription>
              {selectedLetterApp
                ? `${resolveCandidateProfile(selectedLetterApp).name} • Vị trí: ${selectedLetterApp.jobTitle}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 sm:text-sm">
            {selectedLetterApp?.coverLetter ||
              "Ứng viên không đính kèm thư giới thiệu."}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => setSelectedLetterApp(null)}
              className="px-4! py-2! text-xs! font-medium!"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 7. Modal Xác nhận Chuyển Trạng Thái (Status Transition Modal) */}
      <Dialog
        open={Boolean(pendingChange)}
        onOpenChange={(open) => {
          if (!open && !isSubmittingTransition) {
            setPendingChange(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận thay đổi trạng thái</DialogTitle>
            <DialogDescription>
              {pendingChange
                ? `Chuyển hồ sơ của ứng viên ${resolveCandidateProfile(pendingChange.app).name} sang trạng thái "${APPLICATION_STATUS_CONFIG[pendingChange.toStatus]?.label || pendingChange.toStatus}".`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-2">
            <label
              htmlFor="candidate-transition-note"
              className="text-xs font-medium text-slate-700"
            >
              Ghi chú nội bộ (Tùy chọn)
            </label>
            <textarea
              id="candidate-transition-note"
              rows={3}
              value={transitionNote}
              onChange={(e) => setTransitionNote(e.target.value)}
              placeholder="Nhập lý do hoặc thông tin cuộc gọi/phỏng vấn..."
              className="w-full rounded-xl border border-border bg-slate-50/50 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4">
            <Button
              variant="secondary"
              disabled={isSubmittingTransition}
              onClick={() => setPendingChange(null)}
              className="px-4! py-2! text-xs! font-medium!"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              isLoading={isSubmittingTransition}
              onClick={handleConfirmTransition}
              className="px-4! py-2! text-xs! font-semibold!"
            >
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default RecruiterCandidateListPage;
