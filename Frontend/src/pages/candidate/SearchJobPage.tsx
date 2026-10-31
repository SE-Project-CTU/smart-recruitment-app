import { useMemo, useState } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import { Button, CTAMeshGradient, JobCard } from "@/components/common";
import {
  JobFilterSidebar,
  type JobFilterState,
} from "@/components/JobFilterSidebar";
import {
  LocationCombobox,
  type SelectedLocation,
} from "@/components/LocationCombobox";
import { JobDetailDrawer } from "@/components/job";
import { useApplyJobModalStore } from "@/stores/applyJobModalStore";
import { useJobPostings, useJobPostingDetail } from "@/hooks/queries/useJob";
import type { JobPostingSearchItem } from "@/types/job";
import {
  isSalaryNegotiable,
  normalizeJobLevel,
  normalizeJobType,
  normalizeWorkMode,
  toMillion,
} from "@/utils/jobHelpers";
import { Smarthire_icon_default } from "@/assets/images/logo";
import JobCardSkeleton from "@/components/common/JobCardSkeleton";
import { EmptyState } from "@/assets/images/decoration";

type SortKey = "AI_MATCH" | "NEWEST" | "SALARY_DESC" | "SALARY_ASC";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "AI_MATCH", label: "Độ phù hợp" },
  { value: "NEWEST", label: "Mới đăng gần đây" },
  { value: "SALARY_DESC", label: "Mức lương: Cao đến thấp" },
  { value: "SALARY_ASC", label: "Mức lương: Thấp đến cao" },
];

const INITIAL_FILTERS: JobFilterState = {
  industries: [],
  jobTypes: [],
  workModes: [],
  jobLevels: [],
  minSalary: "",
  maxSalary: "",
  negotiableOnly: false,
};

export default function SearchJobPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({
    province: null,
    ward: null,
    provinceId: null,
    wardId: null,
  });
  const [sortBy, setSortBy] = useState<SortKey>("AI_MATCH");
  const [filters, setFilters] = useState<JobFilterState>(INITIAL_FILTERS);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [selectedJob, setSelectedJob] = useState<JobPostingSearchItem | null>(
    null,
  );
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<Set<string>>(
    new Set(),
  );

  const { openApplyModal } = useApplyJobModalStore();

  // Params gửi lên API tìm kiếm tin tuyển dụng từ Backend
  const searchParams = useMemo(() => {
    return {
      keyword: submittedQuery.trim() || undefined,
      provinceId: selectedLocation.provinceId || undefined,
      wardId: selectedLocation.wardId || undefined,
      pageSize: 100,
    };
  }, [submittedQuery, selectedLocation.provinceId, selectedLocation.wardId]);

  // Kéo danh sách việc làm công khai từ Backend API
  const { data: pagedData, isLoading: isLoadingJobs } =
    useJobPostings(searchParams);

  const jobList = useMemo(() => {
    return pagedData?.items || [];
  }, [pagedData?.items]);

  // Lấy chi tiết toàn văn JD khi người dùng mở Drawer
  const { data: jobDetail } = useJobPostingDetail(
    isDetailDrawerOpen && selectedJob ? selectedJob.id : undefined,
  );

  const handleToggleArrayFilter = (
    key: "industries" | "jobTypes" | "workModes" | "jobLevels",
    value: string,
  ) => {
    setFilters((prev) => {
      const exists = prev[key].includes(value);
      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((item) => item !== value)
          : [...prev[key], value],
      };
    });
  };

  const handleToggleIndustryGroup = (parent: string, children: string[]) => {
    setFilters((prev) => {
      const groupItems = [parent, ...children];
      const isAllSelected =
        prev.industries.includes(parent) ||
        (children.length > 0 &&
          children.every((c) => prev.industries.includes(c)));

      if (isAllSelected) {
        return {
          ...prev,
          industries: prev.industries.filter(
            (item) => !groupItems.includes(item),
          ),
        };
      }

      const merged = Array.from(new Set([...prev.industries, ...groupItems]));
      return {
        ...prev,
        industries: merged,
      };
    });
  };

  const handleSalaryRangeChange = (minSalary: string, maxSalary: string) => {
    setFilters((prev) => ({ ...prev, minSalary, maxSalary }));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSubmittedQuery("");
    setSelectedLocation({
      province: null,
      ward: null,
      provinceId: null,
      wardId: null,
    });
    setSortBy("AI_MATCH");
    setFilters(INITIAL_FILTERS);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
  };

  // Bộ lọc đa tiêu chí (Client-side kết hợp với dữ liệu API)
  const filteredAndSortedJobs = useMemo(() => {
    const localQ = searchQuery.trim().toLowerCase();
    const minSal = filters.minSalary !== "" ? Number(filters.minSalary) : null;
    const maxSal = filters.maxSalary !== "" ? Number(filters.maxSalary) : null;

    const list = jobList.filter((job: JobPostingSearchItem) => {
      // 1. Từ khóa tìm kiếm cục bộ (nếu người dùng gõ mà chưa bấm submit)
      if (localQ && localQ !== submittedQuery.trim().toLowerCase()) {
        const matchTitle = job.title.toLowerCase().includes(localQ);
        const matchCompany = job.company?.name?.toLowerCase().includes(localQ);
        const matchSkill = job.skillNames?.some((s) =>
          s.toLowerCase().includes(localQ),
        );
        if (!matchTitle && !matchCompany && !matchSkill) return false;
      }

      // 2. Lọc Lĩnh vực / Ngành nghề
      if (filters.industries.length > 0) {
        const hasMatchingIndustry = job.industryNames?.some((ind) =>
          filters.industries.includes(ind),
        );
        if (!hasMatchingIndustry) return false;
      }

      // 3. Lọc Hình thức làm việc (Full-time, Part-time, Contract...)
      if (filters.jobTypes.length > 0) {
        const typeNormalized = normalizeJobType(job.jobType);
        const isMatched =
          (typeNormalized !== null &&
            filters.jobTypes.includes(typeNormalized)) ||
          (Boolean(job.jobType) &&
            filters.jobTypes.includes(String(job.jobType)));
        if (!isMatched) return false;
      }

      // 4. Lọc Môi trường làm việc (On-site, Hybrid, Remote)
      if (filters.workModes.length > 0) {
        const modeNormalized = normalizeWorkMode(job.workMode);
        const isMatched =
          (modeNormalized !== null &&
            filters.workModes.includes(modeNormalized)) ||
          (Boolean(job.workMode) &&
            filters.workModes.includes(String(job.workMode)));
        if (!isMatched) return false;
      }

      // 5. Lọc Cấp bậc (Intern, Fresher, Junior, Middle, Senior, Lead...)
      if (filters.jobLevels.length > 0) {
        const levelNormalized = normalizeJobLevel(job.jobLevel);
        const isMatched =
          filters.jobLevels.includes(levelNormalized) ||
          (Boolean(job.jobLevel) &&
            filters.jobLevels.includes(String(job.jobLevel)));
        if (!isMatched) return false;
      }

      // 6. Lọc Lương thỏa thuận
      const isNegotiable = isSalaryNegotiable(
        job.salaryMin,
        job.salaryMax,
        job.salaryNegotiable,
      );

      if (filters.negotiableOnly) {
        if (!isNegotiable) return false;
      }

      // 7. Lọc Khoảng lương (Quy đổi sang triệu đồng tương thích với bộ lọc)
      if (minSal !== null || maxSal !== null) {
        // Khi không bật "Chỉ gồm lương thỏa thuận", các công việc thuần thỏa thuận (không có thông tin số tiền) sẽ không tính vào khoảng lương cụ thể
        if (
          !filters.negotiableOnly &&
          isNegotiable &&
          job.salaryMin == null &&
          job.salaryMax == null
        ) {
          return false;
        }

        const jobMin = toMillion(job.salaryMin);
        const jobMax = toMillion(job.salaryMax);

        if (minSal !== null) {
          const effectiveMax = jobMax > 0 ? jobMax : jobMin;
          if (effectiveMax > 0 && effectiveMax < minSal) return false;
        }

        if (maxSal !== null) {
          const effectiveMin = jobMin > 0 ? jobMin : jobMax;
          if (effectiveMin > 0 && effectiveMin > maxSal) return false;
        }
      }

      return true;
    });

    // Sắp xếp danh sách
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "AI_MATCH":
          return (b.aiMatchScore ?? 0) - (a.aiMatchScore ?? 0);
        case "NEWEST":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "SALARY_DESC":
          return (b.salaryMax ?? 0) - (a.salaryMax ?? 0);
        case "SALARY_ASC":
          return (a.salaryMin ?? 0) - (b.salaryMin ?? 0);
        default:
          return 0;
      }
    });
  }, [jobList, searchQuery, submittedQuery, filters, sortBy]);

  const handleSelectJob = (job: JobPostingSearchItem) => {
    setSelectedJob(job);
    setIsDetailDrawerOpen(true);
  };

  const handleToggleBookmark = (jobId: string) => {
    setBookmarkedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const handleApply = (jobId: string) => {
    const targetJob =
      (jobDetail && jobDetail.id === jobId ? jobDetail : null) ||
      filteredAndSortedJobs.find((j) => j.id === jobId) ||
      (selectedJob?.id === jobId ? selectedJob : null);
    if (targetJob) {
      openApplyModal(targetJob);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Card Tìm kiếm cơ hội việc làm */}
      <div className="relative flex min-h-60 w-full rounded-3xl p-6 sm:p-8 lg:p-10">
        <CTAMeshGradient className="rounded-3xl" />

        <div className="relative z-10 flex w-full items-center justify-between gap-8">
          <div className="flex max-w-3xl flex-1 flex-col gap-5">
            <div className="flex flex-col gap-1.5 text-white">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                Tìm kiếm cơ hội việc làm ngay hôm nay!
              </h1>
              <p className="text-xs font-normal text-slate-200/90 sm:text-sm md:text-base">
                Khám phá hơn 12,500+ việc làm với đãi ngộ cạnh tranh được tối ưu
                riêng cho hồ sơ chuyên môn của bạn.
              </p>
            </div>

            {/* Form tìm kiếm tích hợp Địa điểm (Responsive hoàn chỉnh cho mobile và desktop) */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row sm:items-center sm:gap-0 sm:rounded-full"
            >
              {/* 1. Ô nhập từ khóa tìm kiếm */}
              <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-1 sm:py-0">
                <Search className="size-4.5 shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Vị trí tuyển dụng, kỹ năng, công ty..."
                  className="w-full min-w-0 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none sm:text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSubmittedQuery("");
                    }}
                    className="cursor-pointer text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Đường kẻ phân cách trên desktop */}
              <div className="hidden h-6 w-px bg-slate-200 sm:block" />

              {/* Đường kẻ phân cách mờ trên mobile */}
              <div className="h-px w-full bg-slate-100 sm:hidden" />

              {/* 2. Hàng Địa điểm + Nút tìm kiếm */}
              <div className="flex items-center justify-between gap-2 sm:w-auto sm:justify-start">
                <div className="min-w-0 flex-1 sm:w-44 md:w-56 lg:w-64">
                  <LocationCombobox
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                    className="w-full"
                    buttonClassName="flex w-full cursor-pointer items-center justify-between gap-2 border-0 bg-transparent px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none"
                  />
                </div>

                {/* 3. Nút submit -> luôn hiển thị ở cả mobile lẫn desktop */}
                <button
                  type="submit"
                  aria-label="Tìm kiếm"
                  className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md transition-all hover:bg-primary-dark active:scale-95 sm:ml-1 sm:size-10"
                >
                  <ArrowRight className="size-4.5 sm:size-5" />
                </button>
              </div>
            </form>
          </div>

          <div className="hidden shrink-0 opacity-90 lg:block">
            <img
              src={Smarthire_icon_default}
              alt="SmartHire Icon"
              className="h-28 w-auto object-contain drop-shadow-md lg:h-36"
            />
          </div>
        </div>
      </div>

      {/* Thanh công cụ phụ: Sắp xếp & Nút mở filter trên mobile */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            icon={SlidersHorizontal}
            iconSize={14}
            onClick={() => setIsMobileFilterOpen(true)}
            className="shrink-0 rounded-xl! px-3.5! py-1.5! text-xs! lg:hidden!"
          >
            Bộ lọc
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <div className="sticky top-4 hidden w-78 shrink-0 lg:block">
          <JobFilterSidebar
            filters={filters}
            onToggleArrayFilter={handleToggleArrayFilter}
            onToggleIndustryGroup={handleToggleIndustryGroup}
            onSalaryRangeChange={handleSalaryRangeChange}
            onToggleNegotiable={(checked) =>
              setFilters((prev) => ({ ...prev, negotiableOnly: checked }))
            }
            onReset={handleResetFilters}
          />
        </div>

        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="relative z-10 flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto bg-surface p-4 shadow-xl">
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-sm font-semibold text-text-main">
                  Tùy chỉnh bộ lọc
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="rounded-full p-1 text-text-muted hover:bg-bg hover:text-text-main"
                >
                  <X className="size-5" />
                </button>
              </div>
              <JobFilterSidebar
                filters={filters}
                onToggleArrayFilter={handleToggleArrayFilter}
                onToggleIndustryGroup={handleToggleIndustryGroup}
                onSalaryRangeChange={handleSalaryRangeChange}
                onToggleNegotiable={(checked) =>
                  setFilters((prev) => ({ ...prev, negotiableOnly: checked }))
                }
                onReset={handleResetFilters}
              />
            </div>
          </div>
        )}

        <div className="flex w-full flex-1 flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium text-text-muted">
              Tìm thấy{" "}
              <span className="font-semibold text-text-main">
                {isLoadingJobs ? "..." : filteredAndSortedJobs.length}
              </span>{" "}
              công việc
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-1.5 shadow-2xs">
              <ArrowUpDown className="size-3.5 shrink-0 text-text-muted" />
              <span className="text-xs whitespace-nowrap text-text-muted">
                Sắp xếp:
              </span>

              <Select.Root
                items={SORT_OPTIONS}
                value={sortBy}
                onValueChange={(val) => {
                  if (val) setSortBy(val as SortKey);
                }}
              >
                <Select.Trigger
                  aria-label="Sắp xếp công việc"
                  className="group flex cursor-pointer items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-text-main focus:outline-none"
                >
                  <Select.Value />
                  <Select.Icon className="text-text-muted transition-transform duration-200 group-data-popup-open:rotate-180">
                    <ChevronDown className="size-3.5" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Positioner
                    alignItemWithTrigger={false}
                    sideOffset={6}
                  >
                    <Select.Popup className="z-50 min-w-48 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-md">
                      <Select.List>
                        {SORT_OPTIONS.map((opt) => (
                          <Select.Item
                            key={opt.value}
                            value={opt.value}
                            className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-text-main transition-colors hover:bg-bg data-highlighted:bg-bg data-[state=checked]:font-semibold data-[state=checked]:text-primary"
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

          {isLoadingJobs ? (
            <div className="flex flex-wrap justify-items-center gap-5">
              {[1, 2, 3, 4].map((index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredAndSortedJobs.length === 0 ? (
            <div className="flex min-h-80 w-full flex-col items-center justify-center gap-3 rounded-2xl p-8 text-center">
              <img
                src={EmptyState}
                alt="Không tìm thấy"
                loading="lazy"
                className="h-100 w-auto"
              />
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-text-main">
                  Không tìm thấy công việc phù hợp
                </h3>
                <p className="max-w-md text-xs text-text-muted">
                  Thử thay đổi từ khóa tìm kiếm, khu vực hoặc xóa bớt các điều
                  kiện lọc để xem thêm cơ hội việc làm.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleResetFilters}
                className="mt-2 rounded-full! px-4! py-2! text-xs!"
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAndSortedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSelected={job.id === selectedJob?.id && isDetailDrawerOpen}
                  onSelect={handleSelectJob}
                  isBookmarked={bookmarkedJobIds.has(job.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onApply={() => handleApply(job.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <JobDetailDrawer
        job={jobDetail || selectedJob}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        isBookmarked={
          selectedJob ? bookmarkedJobIds.has(selectedJob.id) : false
        }
        onToggleBookmark={handleToggleBookmark}
        onApply={handleApply}
      />
    </div>
  );
}
