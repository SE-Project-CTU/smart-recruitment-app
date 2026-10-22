import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Search,
  X,
  MailCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
import Button from "@/components/Button";
import { CompanyCard } from "@/components/company";
import { companyService } from "@/services/companyService";
import { CreateCompanyModal } from "./CreateCompanyModal";
import type { CompanyItem } from "@/types/company";
import { PATHS } from "@/constants/paths";

export function CompanyListPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const res = await companyService.getMyCompanies();
      setCompanies(res.items);
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSelectCompany = (company: CompanyItem) => {
    navigate(`/recruiter/company-management/${company.id}/overview`);
  };

  const handleCompanyCreated = (newCompany: CompanyItem) => {
    setCompanies((prev) => [newCompany, ...prev]);
    navigate(`/recruiter/company-management/${newCompany.id}/overview`);
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      // Role filter
      if (roleFilter !== "ALL") {
        if (c.membership?.role !== roleFilter) return false;
      }
      // Status filter
      if (statusFilter !== "ALL") {
        if (c.verificationStatus !== statusFilter) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          c.name.toLowerCase().includes(q) ||
          c.taxCode.includes(q) ||
          c.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [companies, roleFilter, statusFilter, searchQuery]);

  // Count stats
  const ownerCount = companies.filter((c) => c.membership?.role === "Owner").length;
  const memberCount = companies.filter((c) => c.membership?.role === "Member").length;

  return (
    <div className="min-h-full space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-main sm:text-2xl">
              Doanh nghiệp của bạn
            </h1>
          </div>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            Quản lý hồ sơ công ty bạn làm Chủ sở hữu (Owner) hoặc trực thuộc chuyên viên tuyển dụng (HR)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tạo công ty mới
          </Button>
        </div>
      </div>

      {/* Stats summary bar if has companies */}
      {companies.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-2xs">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Tổng doanh nghiệp</p>
              <p className="text-lg font-bold text-text-main">{companies.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-2xs">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Chủ sở hữu (Owner)</p>
              <p className="text-lg font-bold text-purple-700">{ownerCount}</p>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-2xs">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Thành viên (HR)</p>
              <p className="text-lg font-bold text-emerald-700">{memberCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {companies.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên công ty, MST hoặc địa chỉ..."
              className="w-full rounded-xl border border-border bg-bg py-2 pr-9 pl-10 text-xs text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-text-muted hover:text-text-main"
                type="button"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text-main outline-none focus:border-primary"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="Owner">Chủ sở hữu (Owner)</option>
              <option value="Member">Thành viên (HR)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text-main outline-none focus:border-primary"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Verified">Đã duyệt (Verified)</option>
              <option value="Pending">Chờ duyệt (Pending)</option>
              <option value="Rejected">Từ chối (Rejected)</option>
            </select>
          </div>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl border border-border bg-surface/50 p-5"
            />
          ))}
        </div>
      ) : companies.length === 0 ? (
        /* Empty State: Recruiter chưa thuộc công ty nào */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-20 text-center shadow-xs">
          <div className="mb-4 flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
            <Building2 className="size-10" />
          </div>
          <h2 className="text-lg font-bold text-text-main sm:text-xl">
            Bạn chưa thuộc doanh nghiệp nào
          </h2>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-text-muted sm:text-sm">
            Để bắt đầu đăng tin tuyển dụng và tìm kiếm ứng viên, bạn có thể tạo hồ sơ doanh nghiệp mới hoặc tham gia bằng lời mời từ đồng nghiệp.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Tạo công ty mới
            </Button>
            <Button
              variant="secondary"
              icon={MailCheck}
              onClick={() => navigate(PATHS.RECRUITER.COMPANY_INVITATION)}
            >
              Xem lời mời tham gia
            </Button>
          </div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        /* No filter results */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
          <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-text-muted">
            <Search className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-text-main">
            Không tìm thấy doanh nghiệp phù hợp
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            Vui lòng thử lại với từ khóa hoặc bộ lọc khác
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setRoleFilter("ALL");
              setStatusFilter("ALL");
            }}
            type="button"
            className="mt-3 text-xs font-semibold text-primary hover:underline"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        /* Grid of Company Cards */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              showBookmark={false}
              actionText="Quản trị công ty"
              onViewDetail={handleSelectCompany}
            />
          ))}
        </div>
      )}

      {/* Modal Tạo công ty mới */}
      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCompanyCreated}
      />
    </div>
  );
}
