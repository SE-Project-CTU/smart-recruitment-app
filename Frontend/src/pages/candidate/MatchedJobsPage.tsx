import { useState, useMemo } from "react";
import {
  Compass,
  BriefcaseBusiness,
  Target,
  CheckCircle,
  ArrowUpDown,
  ChevronDown,
  Search,
  X,
  Filter,
  RotateCcw,
} from "lucide-react";
import { Button, JobCard, GradientGridBackground } from "@/components/common";
import { JobDetailDrawer } from "@/components/job";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import { MOCK_JOB_POSTINGS, type MockJobPosting } from "@/constants/mockData";
import { useMyCvs } from "@/hooks/queries/useCv";

type SortKey = "MATCH_DESC" | "SALARY_DESC" | "NEWEST";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "MATCH_DESC", label: "Độ phù hợp cao nhất" },
  { value: "SALARY_DESC", label: "Mức lương cao nhất" },
  { value: "NEWEST", label: "Mới đăng gần đây" },
];

const WORK_MODE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "On-site", label: "On-site" },
];

export default function MatchedJobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [minMatchScore, setMinMatchScore] = useState<number>(70);
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("MATCH_DESC");
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);

  // Selection & Drawer states
  const [selectedJob, setSelectedJob] = useState<MockJobPosting | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<Set<string>>(
    new Set(["mock-job-1", "mock-job-3"]),
  );

  // Lấy dữ liệu CV của Candidate để hiển thị trạng thái hồ sơ làm cơ sở gợi ý
  const { data: myCvsData } = useMyCvs();
  const cvList = useMemo(() => myCvsData?.items ?? [], [myCvsData?.items]);

  const activeCv = useMemo(() => {
    if (selectedCvId) {
      const found = cvList.find((c) => c.id === selectedCvId);
      if (found) return found;
    }
    return cvList.find((c) => c.isPublic) || cvList[0] || null;
  }, [cvList, selectedCvId]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    minMatchScore !== 70 ||
    selectedWorkMode !== "ALL" ||
    sortBy !== "MATCH_DESC";

  // Lọc và sắp xếp các công việc có mức độ phù hợp cao
  const matchedJobs = useMemo(() => {
    // Lấy các job có điểm aiMatchScore hoặc gán điểm mô phỏng dựa trên skills
    const baseList = (MOCK_JOB_POSTINGS || []).map((job, idx) => {
      // Đảm bảo job luôn có aiMatchScore từ 65% - 98%
      const calculatedScore =
        job.aiMatchScore || Math.max(68, 98 - (idx % 7) * 4);
      return {
        ...job,
        aiMatchScore: calculatedScore,
      };
    });

    let result = baseList.filter(
      (job) => (job.aiMatchScore ?? 0) >= minMatchScore,
    );

    // Filter theo từ khóa
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.name.toLowerCase().includes(q) ||
          j.skills?.some((s) => s.toLowerCase().includes(q)) ||
          j.location.provinceName.toLowerCase().includes(q),
      );
    }

    // Filter theo hình thức làm việc
    if (selectedWorkMode !== "ALL") {
      result = result.filter((j) => j.workMode === selectedWorkMode);
    }

    // Sắp xếp
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "MATCH_DESC":
          return (b.aiMatchScore ?? 0) - (a.aiMatchScore ?? 0);
        case "SALARY_DESC":
          return (b.salaryMax ?? 0) - (a.salaryMax ?? 0);
        case "NEWEST":
          return (
            new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
          );
        default:
          return 0;
      }
    });
  }, [searchQuery, minMatchScore, selectedWorkMode, sortBy]);

  const handleSelectJob = (job: MockJobPosting) => {
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
    console.log("Ứng tuyển việc làm phù hợp:", jobId);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setMinMatchScore(70);
    setSelectedWorkMode("ALL");
    setSortBy("MATCH_DESC");
  };

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* 1. Header Banner: Smart Recommendation Intro theo ngôn ngữ thiết kế SmartHire */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-white p-6 sm:p-8">
        <GradientGridBackground />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-primary">
              <Compass className="size-3.5 text-primary" />
              <span>Gợi ý việc làm thông minh</span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-text-main sm:text-2xl lg:text-3xl">
              Cơ hội nghề nghiệp phù hợp với hồ sơ của bạn
            </h1>

            <p className="text-xs leading-relaxed text-text-muted sm:text-sm">
              Hệ thống tự động phân tích kỹ năng, kinh nghiệm từ CV và lịch sử
              ứng tuyển của bạn để đề xuất các vị trí có tỷ lệ trúng tuyển cao
              nhất.
            </p>

            {activeCv && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                <CheckCircle className="size-3.5 shrink-0 text-emerald-600" />
                <span>Đang đối sánh theo hồ sơ:</span>
                {cvList.length > 1 ? (
                  <select
                    value={activeCv.id}
                    onChange={(e) => setSelectedCvId(e.target.value)}
                    aria-label="Chọn hồ sơ CV đối sánh"
                    className="cursor-pointer rounded-full border border-border bg-white px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors hover:border-primary focus:border-primary focus:outline-none"
                  >
                    {cvList.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.title} {cv.isPublic ? "(Mặc định)" : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <strong className="font-semibold text-text-main">
                    {activeCv.title}
                  </strong>
                )}
              </div>
            )}
          </div>

          {/* Quick Metrics Badge */}
          <div className="grid shrink-0 grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col rounded-2xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:bg-white">
              <span className="text-xs font-medium text-text-muted">
                Độ khớp cao
              </span>
              <span className="mt-1 text-2xl font-semibold text-text-main">
                {matchedJobs.filter((j) => (j.aiMatchScore ?? 0) >= 85).length}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600">
                ≥ 85% phù hợp
              </span>
            </div>

            <div className="flex flex-col rounded-2xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:bg-white">
              <span className="text-xs font-medium text-text-muted">
                Tổng đề xuất
              </span>
              <span className="mt-1 text-2xl font-semibold text-text-main">
                {matchedJobs.length}
              </span>
              <span className="text-[10px] font-semibold text-primary">
                Vị trí mở tuyển
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter Bar & Quick Criteria Selector */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Ô tìm kiếm từ khóa bo dạng viên thuốc */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm công việc, doanh nghiệp, kỹ năng đề xuất..."
              className="w-full rounded-full border border-border bg-slate-50/70 py-2.5 pr-9 pl-10 text-xs font-medium text-text-main placeholder:text-text-muted transition-colors focus:border-primary focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Xóa từ khóa tìm kiếm"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-main"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Nhóm bộ lọc & sắp xếp */}
          <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
            {/* Lọc theo mức độ phù hợp tối thiểu */}
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-slate-50/70 px-3 py-1.5 text-xs">
              <Target className="size-3.5 text-text-muted" />
              <span className="font-medium text-text-muted">Độ khớp:</span>
              <div className="flex items-center gap-1" role="group" aria-label="Lọc theo ngưỡng điểm khớp">
                {[70, 80, 90].map((score) => {
                  const isSelected = minMatchScore === score;
                  return (
                    <button
                      key={score}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setMinMatchScore(score)}
                      className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-primary text-white"
                          : "text-slate-600 hover:bg-slate-200/70"
                      }`}
                    >
                      ≥{score}%
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lọc theo hình thức làm việc qua Pill-shape Segmented Group đồng bộ */}
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-slate-50/70 px-3 py-1.5 text-xs">
              <Filter className="size-3.5 text-text-muted" />
              <span className="font-medium text-text-muted">Hình thức:</span>
              <div
                className="flex items-center gap-1"
                role="group"
                aria-label="Lọc theo hình thức làm việc"
              >
                {WORK_MODE_OPTIONS.map((opt) => {
                  const isSelected = selectedWorkMode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedWorkMode(opt.value)}
                      className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-primary text-white"
                          : "text-slate-600 hover:bg-slate-200/70"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sắp xếp qua Select.Root */}
            <div className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5">
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
                  aria-label="Sắp xếp việc làm"
                  className="group flex cursor-pointer items-center gap-1 text-xs font-semibold whitespace-nowrap text-text-main focus:outline-none"
                >
                  <Select.Value />
                  <Select.Icon className="text-text-muted transition-transform duration-200 group-data-popup-open:rotate-180">
                    <ChevronDown className="size-3.5" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Positioner alignItemWithTrigger={false} sideOffset={6}>
                    <Select.Popup className="z-50 min-w-48 overflow-hidden rounded-xl border border-border bg-white p-1">
                      <Select.List>
                        {SORT_OPTIONS.map((opt) => (
                          <Select.Item
                            key={opt.value}
                            value={opt.value}
                            className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-text-main transition-colors hover:bg-slate-100 data-highlighted:bg-slate-100 data-[state=checked]:font-semibold data-[state=checked]:text-primary"
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

            {/* Nút reset nhanh khi có bộ lọc */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                title="Đặt lại bộ lọc về mặc định"
                className="flex cursor-pointer items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-primary/40 hover:text-text-main"
              >
                <RotateCcw className="size-3" />
                <span className="hidden sm:inline">Đặt lại</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Job Grid Results */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-medium text-text-muted">
            Tìm thấy{" "}
            <span className="font-semibold text-text-main">
              {matchedJobs.length}
            </span>{" "}
            vị trí phù hợp nhất với hồ sơ
          </p>
        </div>

        {matchedJobs.length === 0 ? (
          <div className="flex min-h-80 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <BriefcaseBusiness className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-text-main">
                Không tìm thấy công việc phù hợp với tiêu chí hiện tại
              </h3>
              <p className="max-w-md text-xs text-text-muted">
                Bạn có thể giảm yêu cầu về điểm tương thích (ví dụ về mức ≥70%)
                hoặc xóa bộ lọc từ khóa để khám phá thêm nhiều cơ hội.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleResetFilters}
              className="mt-2"
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {matchedJobs.map((job) => (
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
      </section>

      {/* 4. Drawer xem chi tiết toàn văn JD và nộp hồ sơ */}
      <JobDetailDrawer
        job={selectedJob}
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
