import { useState, useMemo } from "react";
import { Search, X, Building2 } from "lucide-react";
import { CompanyCard, CompanyDetailDrawer } from "@/components/company";
import { MOCK_COMPANIES, type CompanyItem } from "@/constants/mockData";

const INITIAL_BOOKMARKS = new Set(MOCK_COMPANIES.map((c) => c.id));

export default function BookmarkCompanies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedIds, setBookmarkedIds] =
    useState<Set<string>>(INITIAL_BOOKMARKS);
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleViewDetail = (company: CompanyItem) => {
    setSelectedCompany(company);
    setIsDrawerOpen(true);
  };

  const bookmarkedCompanies = useMemo(
    () => MOCK_COMPANIES.filter((c) => bookmarkedIds.has(c.id)),
    [bookmarkedIds],
  );

  const filteredCompanies = useMemo(() => {
    let result = bookmarkedCompanies;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q),
      );
    }

    return result;
  }, [bookmarkedCompanies, searchQuery]);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <Building2 className="size-6 text-primary" />
          <h1 className="text-xl font-semibold text-text-main">
            Công ty đã lưu
          </h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-5">
        <div className="relative">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, lĩnh vực hoặc địa chỉ..."
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

      {/* Grid hoặc Empty state */}
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              isBookmarked={bookmarkedIds.has(company.id)}
              onToggleBookmark={handleToggleBookmark}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>
      ) : bookmarkedIds.size === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/8">
            <Building2 className="size-7 text-primary/50" />
          </div>
          <p className="text-sm font-medium text-text-main">
            Chưa có công ty nào được lưu
          </p>
          <p className="mt-1.5 max-w-xs text-xs text-text-muted">
            Khám phá các công ty và nhấn Bookmark để lưu lại.
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
            Thử thay đổi từ khóa hoặc bộ lọc khác
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
            }}
            type="button"
            className="mt-4 text-xs font-medium text-primary hover:underline"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Drawer xem chi tiết công ty */}
      <CompanyDetailDrawer
        company={selectedCompany}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isBookmarked={
          selectedCompany ? bookmarkedIds.has(selectedCompany.id) : false
        }
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
