import { useSearchJobPage } from "./useSearchJobPage";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import { Button, CTAMeshGradient, JobCard } from "@/components/common";
import { JobFilterSidebar } from "@/components/JobFilterSidebar";
import { LocationCombobox } from "@/components/LocationCombobox";
import { JobDetailDrawer } from "@/components/job";
import { Smarthire_icon_default } from "@/assets/images/logo";
import JobCardSkeleton from "@/components/common/JobCardSkeleton";
import { EmptyState } from "@/assets/images/decoration";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "NEWEST", label: "Mới đăng gần đây" },
  { value: "SALARY_DESC", label: "Mức lương: Cao đến thấp" },
  { value: "SALARY_ASC", label: "Mức lương: Thấp đến cao" },
];
const PAGE_SIZE = 30;

function getPaginationRange(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

export default function SearchJobPage({
  isPublicPage = false,
}: {
  isPublicPage?: boolean;
}) {
  const {
    setUrlParams,
    currentPage,
    setCurrentPage,
    jobListTopRef,
    searchQuery,
    setSearchQuery,
    selectedLocation,
    sortBy,
    filters,
    isMobileFilterOpen,
    setIsMobileFilterOpen,
    selectedJob,
    isDetailDrawerOpen,
    setIsDetailDrawerOpen,
    bookmarkedJobIds,
    jobList,
    totalPages,
    totalItems,
    isFetchingJobs,
    isJobsError,
    jobDetail,
    handleToggleArrayFilter,
    handleToggleSingleFilter,
    handleToggleIndustryGroup,
    handleSalaryRangeChange,
    handleToggleNegotiable,
    handleResetFilters,
    handleSearchSubmit,
    handlePageChange,
    handleSelectJob,
    handleToggleBookmark,
    handleApply,
  } = useSearchJobPage();
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
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearchQuery(e.target.value);
                  }}
                  placeholder="Vị trí tuyển dụng, kỹ năng, công ty..."
                  className="w-full min-w-0 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none sm:text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage(1);
                      setSearchQuery("");
                      setUrlParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.delete("keyword");
                        next.delete("page");
                        return next;
                      });
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
                    onChange={(location) => {
                      setCurrentPage(1);
                      setUrlParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.delete("page");
                        next.delete("provinceId");
                        next.delete("wardId");
                        if (location.provinceId)
                          next.set("provinceId", location.provinceId);
                        if (location.wardId)
                          next.set("wardId", location.wardId);
                        return next;
                      });
                    }}
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

      <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-5">
        <div
          className={cn(
            "sticky hidden min-h-0 shrink-0 self-start lg:block",
            "w-56 xl:w-76 3xl:w-85",
            isPublicPage
              ? "top-25 h-[calc(100svh-7.5rem)]"
              : "top-22 h-[calc(100svh-5rem)]",
          )}
        >
          <JobFilterSidebar
            filters={filters}
            onToggleArrayFilter={handleToggleArrayFilter}
            onToggleSingleFilter={handleToggleSingleFilter}
            onToggleIndustryGroup={handleToggleIndustryGroup}
            onSalaryRangeChange={handleSalaryRangeChange}
            onToggleNegotiable={handleToggleNegotiable}
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
                onToggleSingleFilter={handleToggleSingleFilter}
                onToggleIndustryGroup={handleToggleIndustryGroup}
                onSalaryRangeChange={handleSalaryRangeChange}
                onToggleNegotiable={handleToggleNegotiable}
                onReset={handleResetFilters}
              />
            </div>
          </div>
        )}

        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          {/* Mốc cuộn tự động khi đổi trang */}
          <div ref={jobListTopRef} className="scroll-mt-32" />

          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium text-text-muted">
              Tìm thấy{" "}
              <span className="font-semibold text-text-main">
                {isFetchingJobs ? "..." : totalItems}
              </span>{" "}
              công việc
              {!isFetchingJobs && totalPages > 1 && (
                <span className="ml-1 text-slate-400">
                  (Trang {currentPage}/{totalPages})
                </span>
              )}
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
                  if (val) {
                    setCurrentPage(1);
                    setUrlParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete("page");
                      if (val === "NEWEST") next.delete("sortBy");
                      else next.set("sortBy", val);
                      return next;
                    });
                  }
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

          {isFetchingJobs ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
              {[1, 2, 3, 4].map((index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          ) : isJobsError ? (
            <div className="rounded-xl bg-surface p-8 text-center text-sm text-text-muted">
              Không tải được danh sách việc làm. Vui lòng thử lại.
            </div>
          ) : totalItems === 0 ? (
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
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
                {jobList.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSelected={
                      job.id === selectedJob?.id && isDetailDrawerOpen
                    }
                    onSelect={handleSelectJob}
                    isBookmarked={bookmarkedJobIds.has(job.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onApply={() => handleApply(job.id)}
                  />
                ))}
              </div>

              {/* Thanh phân trang Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-border/80 pt-4 sm:flex-row">
                  <span className="text-xs text-text-muted">
                    Hiển thị{" "}
                    <span className="font-semibold text-text-main">
                      {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
                      {Math.min(currentPage * PAGE_SIZE, totalItems)}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-semibold text-text-main">
                      {totalItems}
                    </span>{" "}
                    việc làm
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Nút Về trước */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:border-slate-300 hover:text-text-main disabled:pointer-events-none disabled:opacity-40"
                      aria-label="Trang trước"
                    >
                      <ChevronLeft className="size-4" />
                    </button>

                    {/* Danh sách nút số trang */}
                    {getPaginationRange(currentPage, totalPages).map(
                      (p, idx) => {
                        if (p === "...") {
                          return (
                            <span
                              key={`ellipsis-${idx}`}
                              className="px-1 text-xs font-bold text-text-muted select-none"
                            >
                              ...
                            </span>
                          );
                        }

                        const isCurrent = p === currentPage;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePageChange(p)}
                            className={`flex size-8 cursor-pointer items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                              isCurrent
                                ? "bg-primary text-white"
                                : "border border-border bg-surface text-text-main hover:border-slate-300 hover:bg-bg"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      },
                    )}

                    {/* Nút Kế tiếp */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:border-slate-300 hover:text-text-main disabled:pointer-events-none disabled:opacity-40"
                      aria-label="Trang tiếp theo"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <JobDetailDrawer
        job={jobDetail || selectedJob}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        isBookmarked={
          jobDetail?.isBookmarked !== undefined
            ? jobDetail.isBookmarked
            : selectedJob
              ? bookmarkedJobIds.has(selectedJob.id)
              : false
        }
        onToggleBookmark={handleToggleBookmark}
        onApply={handleApply}
      />
    </div>
  );
}
