import { useState } from "react";
import { Search, X, BookmarkCheck, Loader2 } from "lucide-react";
import { EmptyStreet } from "@/assets/images/decoration";
import { JobCard } from "@/components/common";
import { JobDetailDrawer } from "@/components/job";
import {
  useMyBookmarkedJobs,
  useUnbookmarkJob,
} from "@/hooks/queries/useJob";
import type { BookmarkedJobResult } from "@/types/job";

export default function BookmarkJobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<BookmarkedJobResult | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. Kéo danh sách việc làm đã lưu từ API
  const { data: bookmarkedData, isLoading } = useMyBookmarkedJobs({
    search: searchQuery.trim() || undefined,
  });

  const unbookmarkMutation = useUnbookmarkJob();
  const bookmarkedJobs = bookmarkedData?.items || [];

  const handleToggleBookmark = (jobId: string) => {
    unbookmarkMutation.mutate(jobId);
    if (selectedJob?.id === jobId) {
      setIsDrawerOpen(false);
      setSelectedJob(null);
    }
  };

  const handleSelectJob = (job: BookmarkedJobResult) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <BookmarkCheck className="size-6 text-primary" />
          <h1 className="text-xl font-semibold text-text-main">
            Việc làm đã lưu
          </h1>
        </div>
        <p className="text-xs text-text-muted">
          Danh sách các cơ hội nghề nghiệp bạn đã lưu để ứng tuyển sau
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-5">
        <div className="relative">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo vị trí công việc, công ty..."
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

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="mt-3 text-xs text-text-muted">
            Đang tải danh sách việc làm đã lưu...
          </p>
        </div>
      ) : bookmarkedJobs.length > 0 ? (
        <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bookmarkedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSelected={job.id === selectedJob?.id && isDrawerOpen}
              onSelect={handleSelectJob}
              isBookmarked={true}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      ) : searchQuery ? (
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
            Xóa tìm kiếm
          </button>
        </div>
      ) : (
        <section className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
          <img
            src={EmptyStreet}
            alt="Chưa có việc làm nào được lưu"
            loading="lazy"
            className="h-80 w-auto md:h-100"
          />
          <h2 className="text-base font-semibold text-text-main">
            Chưa có việc làm nào được lưu
          </h2>
          <p className="max-w-xs text-xs text-text-muted">
            Khám phá các cơ hội việc làm và nhấn Bookmark để lưu lại.
          </p>
        </section>
      )}

      {/* Job Detail Drawer */}
      <JobDetailDrawer
        job={selectedJob}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isBookmarked={true}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
