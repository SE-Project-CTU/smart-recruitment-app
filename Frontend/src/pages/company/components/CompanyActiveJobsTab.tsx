import { useState, useMemo } from "react";
import { Search, X, Briefcase, Loader2 } from "lucide-react";
import { JobCard } from "@/components/common/JobCard";
import { ApplyJobModal } from "@/components/job/ApplyJobModal";
import { useCompanyActivePublicJobs } from "@/hooks/queries/useJob";
import type { JobPostingSearchItem } from "@/types/job";
import Button from "@/components/common/Button";

export interface CompanyActiveJobsTabProps {
  companyId: string;
  companyName: string;
  companyLogoUrl?: string | null;
}

export function CompanyActiveJobsTab({
  companyId,
  companyName,
  companyLogoUrl,
}: CompanyActiveJobsTabProps) {
  const [keyword, setKeyword] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isPlaceholderData } = useCompanyActivePublicJobs(
    companyId,
    {
      keyword: searchSubmitted.trim() || undefined,
      page: currentPage,
      pageSize: 10,
    },
  );

  const jobs: JobPostingSearchItem[] = useMemo(() => {
    return data?.items || [];
  }, [data?.items]);

  const totalPages = data?.meta?.totalPages || 1;
  const totalItems = data?.meta?.totalItems || jobs.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchSubmitted(keyword);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setKeyword("");
    setSearchSubmitted("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Bộ lọc nhanh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-main">
            Vị trí đang tuyển dụng ({totalItems})
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Khám phá các cơ hội nghề nghiệp phù hợp tại {companyName}
          </p>
        </div>

        {/* Thanh tìm kiếm vị trí */}
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo chức danh, vị trí..."
            className="w-full rounded-xl border border-border bg-surface py-2 pr-9 pl-9 text-xs text-text-main transition-colors outline-none placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          {keyword && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-text-muted hover:text-text-main"
            >
              <X className="size-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* 2. Danh sách Job hoặc Loading / Empty state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="mt-3 text-xs text-text-muted">
            Đang tải danh sách vị trí tuyển dụng...
          </p>
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              companyLogoUrl={companyLogoUrl}
              role="candidate"
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-text-muted">
              <span>
                Trang {currentPage} / {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="text-xs px-3 py-1.5"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || isPlaceholderData}
                >
                  Trang trước
                </Button>
                <Button
                  variant="outline"
                  className="text-xs px-3 py-1.5"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages || isPlaceholderData}
                >
                  Trang kế
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 py-16 px-4 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Briefcase className="size-6" />
          </div>
          <p className="text-sm font-medium text-text-main">
            {searchSubmitted
              ? "Không tìm thấy vị trí phù hợp"
              : "Hiện chưa có vị trí đang tuyển dụng"}
          </p>
          <p className="mt-1 text-xs text-text-muted max-w-sm">
            {searchSubmitted
              ? `Không có kết quả nào khớp với "${searchSubmitted}". Vui lòng thử tìm với từ khóa khác.`
              : `${companyName} hiện chưa mở đợt tuyển dụng mới. Hãy bấm "Theo dõi công ty" để nhận thông báo ngay khi có việc làm mới.`}
          </p>
          {searchSubmitted && (
            <Button
              variant="outline"
              className="mt-4 text-xs px-3.5 py-1.5"
              onClick={handleClear}
            >
              Xem tất cả vị trí
            </Button>
          )}
        </div>
      )}

      {/* Modal Ứng tuyển gắn tại trang để Candidate có thể ứng tuyển trực tiếp */}
      <ApplyJobModal />
    </div>
  );
}

export default CompanyActiveJobsTab;
