import { useState, useMemo } from "react";
import { Search, X, Building2, Loader2 } from "lucide-react";
import { CompanyCard, CompanyDetailDrawer } from "@/components/company";
import {
  useMyFollowedCompanies,
  useUnfollowCompany,
} from "@/hooks/queries/useCompany";
import type { CompanyItem, CompanyVerificationStatus } from "@/types/company";

export default function BookmarkCompanies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. Kéo danh sách công ty đã follow từ API thật
  const { data: followedData, isLoading } = useMyFollowedCompanies({
    search: searchQuery.trim() || undefined,
  });

  const unfollowMutation = useUnfollowCompany();

  // 2. Chuyển đổi dữ liệu sang CompanyItem để tương thích với CompanyCard
  const followedCompanies: CompanyItem[] = useMemo(() => {
    return (followedData?.items || []).map((c) => ({
      id: c.id,
      name: c.name,
      taxCode: "",
      email: "",
      phone: "",
      address: c.address || "",
      website: c.website || "",
      description: "",
      logoUrl: c.logoUrl ?? null,
      verificationStatus:
        (c.verificationStatus as CompanyVerificationStatus) || "Verified",
      verifiedAt: null,
      createdAt: c.followedAt,
      updatedAt: c.followedAt,
    }));
  }, [followedData?.items]);

  const handleToggleBookmark = (id: string) => {
    unfollowMutation.mutate(id);
  };

  const handleViewDetail = (company: CompanyItem) => {
    setSelectedCompany(company);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <Building2 className="size-6 text-primary" />
          <h1 className="text-xl font-semibold text-text-main">
            Công ty đã theo dõi
          </h1>
        </div>
        <p className="text-xs text-text-muted">
          Danh sách các doanh nghiệp bạn đang theo dõi để nhận thông báo việc làm mới
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
            placeholder="Tìm theo tên hoặc địa chỉ doanh nghiệp..."
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
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="mt-3 text-xs text-text-muted">Đang tải danh sách công ty đã theo dõi...</p>
        </div>
      ) : followedCompanies.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {followedCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              isBookmarked={true}
              onToggleBookmark={handleToggleBookmark}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-bg">
            <Search className="size-7 text-text-muted/50" />
          </div>
          <p className="text-sm font-medium text-text-main">
            Không tìm thấy công ty phù hợp
          </p>
          <p className="mt-1.5 text-xs text-text-muted">
            Thử thay đổi từ khóa tìm kiếm
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/8">
            <Building2 className="size-7 text-primary/50" />
          </div>
          <p className="text-sm font-medium text-text-main">
            Chưa có công ty nào được theo dõi
          </p>
          <p className="mt-1.5 max-w-xs text-xs text-text-muted">
            Khám phá các doanh nghiệp tuyển dụng và nhấn Theo dõi để cập nhật tin mới nhất.
          </p>
        </div>
      )}

      {/* Drawer xem chi tiết công ty */}
      <CompanyDetailDrawer
        company={selectedCompany}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isBookmarked={true}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
