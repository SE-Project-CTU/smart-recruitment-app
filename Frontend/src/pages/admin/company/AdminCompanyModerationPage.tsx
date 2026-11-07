import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  RotateCcw,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";

import { Button, TableSkeleton } from "@/components/common";
import { Input } from "@/components/ui/input";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { CompanyInspectionSheet } from "./CompanyInspectionSheet";
import { useAdminCompanies } from "@/hooks/queries/useAdmin";
import type { AdminCompanyItem, AdminCompanyVerificationStatus } from "@/types/admin";
import { cn } from "@/lib/utils";

dayjs.locale("vi");

const TABS = [
  { id: "Pending", label: "Chờ thẩm định", icon: Clock },
  { id: "Verified", label: "Đã xác thực", icon: CheckCircle2 },
  { id: "Rejected", label: "Bị từ chối", icon: XCircle },
  { id: "All", label: "Tất cả hồ sơ", icon: Building2 },
] as const;

export default function AdminCompanyModerationPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc params từ URL
  const activeTab = (searchParams.get("tab") || "Pending") as string;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const pageSize = 10;

  // Local state cho search input
  const [searchInput, setSearchInput] = useState(search);

  // Doanh nghiệp đang được mở trong Sheet thẩm định
  const [inspectingCompany, setInspectingCompany] =
    useState<AdminCompanyItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Xác định verificationStatus để gọi API
  const queryStatus =
    activeTab === "All"
      ? undefined
      : (activeTab as AdminCompanyVerificationStatus);

  // Gọi API lấy danh sách doanh nghiệp
  const {
    data: pagedResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useAdminCompanies({
    verificationStatus: queryStatus,
    search: search || undefined,
    page,
    pageSize,
  });

  const companies = pagedResponse?.data ?? [];
  const meta = pagedResponse?.meta;
  const totalPages = meta?.totalPages ?? 1;

  // Cập nhật URL search params an toàn
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "") {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    setSearchParams(next);
  };

  const handleTabChange = (tabId: string) => {
    updateParams({ tab: tabId, page: "1" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim(), page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateParams({ page: newPage.toString() });
  };

  const handleInspect = (company: AdminCompanyItem) => {
    setInspectingCompany(company);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header Trang */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">
            Thẩm định doanh nghiệp
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Kiểm tra mã số thuế, thông tin người đại diện và cấp quyền tuyển dụng công khai.
          </p>
        </div>

        <Button
          variant="outline"
          icon={RotateCcw}
          isLoading={isRefetching}
          onClick={() => refetch()}
          className="h-9 self-start rounded-xl px-3.5 text-xs font-semibold sm:self-auto"
        >
          Làm mới
        </Button>
      </div>

      {/* 2. Tabs trạng thái & Toolbar lọc */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-3">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-muted hover:bg-bg hover:text-text-main",
                )}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm theo tên công ty, MST hoặc email..."
              className="h-10 rounded-xl pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              className="h-10 rounded-xl px-4 text-xs font-semibold"
            >
              Tìm kiếm
            </Button>
            {search && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput("");
                  updateParams({ search: null, page: "1" });
                }}
                className="h-10 rounded-xl px-3 text-xs"
              >
                Xóa tìm kiếm
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* 3. Bảng Dữ liệu Doanh nghiệp */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Building2 className="size-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-text-main">
              Không tìm thấy hồ sơ doanh nghiệp nào
            </h3>
            <p className="mt-1 max-w-sm text-xs text-text-muted">
              {search
                ? `Không có kết quả nào khớp với từ khóa "${search}".`
                : "Hiện tại không có doanh nghiệp nào thuộc trạng thái này."}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/80 bg-slate-50/60 font-semibold text-text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Doanh nghiệp</th>
                  <th className="px-4 py-3.5">Mã số thuế</th>
                  <th className="px-4 py-3.5">Chủ sở hữu / Owner</th>
                  <th className="px-4 py-3.5">Trụ sở</th>
                  <th className="px-4 py-3.5">Ngày nộp</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {companies.map((company) => {
                  const status = (company.verificationStatus || "Pending").toUpperCase();
                  const isPending = status === "PENDING";
                  const isVerified = status === "VERIFIED";
                  const isRejected = status === "REJECTED";

                  return (
                    <tr
                      key={company.id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      {/* Doanh nghiệp */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <CompanyLogo
                            name={company.name}
                            logoUrl={company.logoUrl}
                            size="sm"
                          />
                          <div className="min-w-0 max-w-xs">
                            <span className="block truncate font-bold text-text-main">
                              {company.name}
                            </span>
                            <span className="block truncate text-[11px] text-text-muted">
                              {company.email || "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Mã số thuế */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-medium text-text-main">
                          {company.taxCode || "—"}
                        </span>
                      </td>

                      {/* Chủ sở hữu */}
                      <td className="px-4 py-3.5">
                        {company.owner ? (
                          <div className="min-w-0 max-w-44">
                            <span className="block truncate font-semibold text-text-main">
                              {company.owner.fullName}
                            </span>
                            <span className="block truncate text-[11px] text-text-muted">
                              {company.owner.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-text-muted italic">—</span>
                        )}
                      </td>

                      {/* Trụ sở */}
                      <td className="px-4 py-3.5">
                        <span className="block max-w-48 truncate text-text-muted">
                          {company.address || "—"}
                        </span>
                      </td>

                      {/* Ngày nộp */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-text-muted">
                        {dayjs(company.createdAt).format("DD/MM/YYYY")}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                            <Clock className="size-3" />
                            Chờ thẩm định
                          </span>
                        )}
                        {isVerified && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="size-3" />
                            Đã xác thực
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                            <XCircle className="size-3" />
                            Bị từ chối
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          icon={Eye}
                          onClick={() => handleInspect(company)}
                          className={cn(
                            "h-8 rounded-lg px-3 text-xs font-semibold",
                            isPending
                              ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                              : "text-text-main hover:bg-bg",
                          )}
                        >
                          {isPending ? "Thẩm định" : "Xem hồ sơ"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Thanh phân trang */}
        {meta && meta.totalItems > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border/70 p-4 sm:flex-row">
            <span className="text-xs text-text-muted">
              Hiển thị{" "}
              <strong className="font-semibold text-text-main">
                {(page - 1) * pageSize + 1} -{" "}
                {Math.min(page * pageSize, meta.totalItems)}
              </strong>{" "}
              trong tổng số{" "}
              <strong className="font-semibold text-text-main">
                {meta.totalItems}
              </strong>{" "}
              doanh nghiệp
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                icon={ChevronLeft}
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="size-8 p-0"
                aria-label="Trang trước"
              />
              <span className="px-2 text-xs font-semibold text-text-main">
                Trang {page} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                icon={ChevronRight}
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="size-8 p-0"
                aria-label="Trang sau"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sheet thẩm định chi tiết doanh nghiệp */}
      <CompanyInspectionSheet
        company={inspectingCompany}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setInspectingCompany(null);
        }}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
