import { useState, useMemo } from "react";
import { Search, X, BookmarkCheck } from "lucide-react";
import { JobCard } from "@/components/common";
import { JobDetailDrawer } from "@/components/job";
import { MOCK_JOB_POSTINGS, type MockJobPosting } from "@/constants/mockData";

const INITIAL_BOOKMARKED_JOB_IDS = new Set(
  (MOCK_JOB_POSTINGS || []).slice(0, 4).map((j) => j.id),
);

export default function BookmarkJobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    INITIAL_BOOKMARKED_JOB_IDS,
  );
  const [selectedJob, setSelectedJob] = useState<MockJobPosting | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleToggleBookmark = (jobId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const handleSelectJob = (job: MockJobPosting) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  const bookmarkedJobs = useMemo(
    () => (MOCK_JOB_POSTINGS || []).filter((j) => bookmarkedIds.has(j.id)),
    [bookmarkedIds],
  );

  const filteredJobs = useMemo(() => {
    let result = bookmarkedJobs;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.name.toLowerCase().includes(q) ||
          j.skills?.some((s) => s.toLowerCase().includes(q)) ||
          j.location.provinceName.toLowerCase().includes(q) ||
          j.location.wardName?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [bookmarkedJobs, searchQuery]);

  return (
    <div className="min-h-full">
      <div className="mb-7 flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <BookmarkCheck className="size-6 text-primary" />
          <h1 className="text-xl font-semibold text-text-main">
            Việc làm đã lưu
          </h1>
        </div>
      </div>

      <div className="mb-5">
        <div className="relative">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo vị trí công việc, công ty, kỹ năng hoặc địa điểm..."
            className="w-full rounded-xl border border-border bg-surface py-2.5 pr-9 pl-10 text-sm text-text-main transition-colors outline-none placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 text-text-muted hover:text-text-main"
              type="button"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSelected={job.id === selectedJob?.id && isDrawerOpen}
              onSelect={handleSelectJob}
              isBookmarked={bookmarkedIds.has(job.id)}
              onToggleBookmark={handleToggleBookmark}
              onApply={() => console.log("Apply to job:", job.id)}
            />
          ))}
        </div>
      ) : bookmarkedIds.size === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/8">
            <BookmarkCheck className="size-7 text-primary/50" />
          </div>
          <p className="text-sm font-medium text-text-main">
            Chưa có việc làm nào được lưu
          </p>
          <p className="mt-1.5 max-w-xs text-xs text-text-muted">
            Khám phá các cơ hội việc làm và nhấn Bookmark để lưu lại.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-bg">
            <Search className="size-7 text-text-muted/50" />
          </div>
          <p className="text-sm font-medium text-text-main">
            Không có kết quả phù hợp
          </p>
          <p className="mt-1.5 text-xs text-text-muted">
            Thử thay đổi từ khóa tìm kiếm khác
          </p>
          <button
            onClick={() => setSearchQuery("")}
            type="button"
            className="mt-4 text-xs font-medium text-primary hover:underline"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      <JobDetailDrawer
        job={selectedJob}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isBookmarked={selectedJob ? bookmarkedIds.has(selectedJob.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onApply={(id) => console.log("Apply to job:", id)}
      />
    </div>
  );
}
