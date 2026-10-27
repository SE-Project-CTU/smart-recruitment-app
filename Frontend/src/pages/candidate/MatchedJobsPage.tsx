import { useState, useMemo } from "react";
import {
  Compass,
  SlidersHorizontal,
  BriefcaseBusiness,
  TrendingUp,
  Target,
  CheckCircle,
  Building2,
  DollarSign,
  ArrowUpDown,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import { Button, JobCard } from "@/components/common";
import { JobDetailDrawer } from "@/components/job";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import {
  MOCK_JOB_POSTINGS,
  type MockJobPosting,
} from "@/constants/mockData";
import { useCvTemplates, useMyCvs } from "@/hooks/queries/useCv";

type SortKey = "MATCH_DESC" | "SALARY_DESC" | "NEWEST";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "MATCH_DESC", label: "Độ phù hợp cao nhất" },
  { value: "SALARY_DESC", label: "Mức lương cao nhất" },
  { value: "NEWEST", label: "Mới đăng gần đây" },
];

export default function MatchedJobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [minMatchScore, setMinMatchScore] = useState<number>(70);
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("MATCH_DESC");

  // Selection & Drawer states
  const [selectedJob, setSelectedJob] = useState<MockJobPosting | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<Set<string>>(
    new Set(["mock-job-1", "mock-job-3"]),
  );

  // Lấy dữ liệu CV của Candidate để hiển thị trạng thái hồ sơ làm cơ sở gợi ý
  const { data: myCvsData } = useMyCvs();
  const cvList = myCvsData?.items ?? [];
  const primaryCv = cvList.find((c) => c.isPublic) || cvList[0];

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

    let result = baseList.filter((job) => (job.aiMatchScore ?? 0) >= minMatchScore);

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

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* 1. Header Banner: Smart Recommendation Intro (Không dùng icon Sparkles/ngôi sao) */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-sm sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-md">
              <Compass className="size-3.5 text-indigo-300" />
              <span>Gợi ý việc làm thông minh</span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
              Cơ hội nghề nghiệp phù hợp với hồ sơ của bạn
            </h1>

            <p className="text-xs text-slate-300 sm:text-sm leading-relaxed">
              Hệ thống tự động phân tích kỹ năng, kinh nghiệm từ CV và lịch sử ứng
              tuyển của bạn để đề xuất các vị trí có tỷ lệ trúng tuyển cao nhất.
            </p>

            {primaryCv && (
              <div className="mt-3 flex items-center gap-2 text-xs text-indigo-200/90">
                <CheckCircle className="size-3.5 text-emerald-400 shrink-0" />
                <span>
                  Đang đối sánh theo hồ sơ:{" "}
                  <strong className="text-white font-semibold underline underline-offset-2">
                    {primaryCv.title}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Quick Metrics Badge */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <span className="text-xs font-medium text-slate-300">Độ khớp cao</span>
              <span className="mt-1 text-2xl font-bold text-white">
                {matchedJobs.filter((j) => (j.aiMatchScore ?? 0) >= 85).length}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">≥ 85% phù hợp</span>
            </div>

            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <span className="text-xs font-medium text-slate-300">Tổng đề xuất</span>
              <span className="mt-1 text-2xl font-bold text-white">
                {matchedJobs.length}
              </span>
              <span className="text-[10px] text-indigo-300 font-medium">Vị trí mở tuyển</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter Bar & Quick Criteria Selector */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Ô tìm kiếm từ khóa */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm công việc, doanh nghiệp, kỹ năng đề xuất..."
              className="w-full rounded-xl border border-border bg-slate-50/60 py-2.5 pl-10 pr-9 text-xs font-medium text-text-main placeholder:text-text-muted focus:border-primary focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-main"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Nhóm bộ lọc & sắp xếp */}
          <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
            {/* Lọc theo mức độ phù hợp tối thiểu */}
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-slate-50/60 px-3 py-1.5 text-xs">
              <Target className="size-3.5 text-text-muted" />
              <span className="text-text-muted">Độ khớp:</span>
              <div className="flex items-center gap-1">
                {[70, 80, 90].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setMinMatchScore(score)}
                    className={`cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                      minMatchScore === score
                        ? "bg-primary text-white"
                        : "text-slate-600 hover:bg-slate-200/70"
                    }`}
                  >
                    ≥{score}%
                  </button>
                ))}
              </div>
            </div>

            {/* Lọc theo hình thức làm việc */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2">
              <span className="text-xs text-text-muted">Hình thức:</span>
              <select
                aria-label="Hình thức làm việc"
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2">
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
                  className="group flex cursor-pointer items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-text-main focus:outline-none"
                >
                  <Select.Value />
                  <Select.Icon className="text-text-muted transition-transform duration-200 group-data-popup-open:rotate-180">
                    <ChevronDown className="size-3.5" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Positioner alignItemWithTrigger={false} sideOffset={6}>
                    <Select.Popup className="z-50 min-w-48 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-md">
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
          <div className="flex min-h-80 w-full flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-white p-8 text-center shadow-2xs">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <BriefcaseBusiness className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-text-main">
                Không tìm thấy công việc phù hợp với tiêu chí hiện tại
              </h3>
              <p className="max-w-md text-xs text-text-muted">
                Bạn có thể giảm yêu cầu về điểm tương thích (ví dụ về mức ≥70%) hoặc
                xóa bộ lọc từ khóa để khám phá thêm nhiều cơ hội.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearchQuery("");
                setMinMatchScore(70);
                setSelectedWorkMode("ALL");
              }}
              className="mt-2 rounded-full! px-4! py-2! text-xs!"
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
