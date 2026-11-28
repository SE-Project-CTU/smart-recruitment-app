import React from "react";
import { cn } from "cn";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPaginationRange } from "@/utils/pagination";

export interface DashboardPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  entityLabel?: string;
  className?: string;
}

/**
 * Phân trang chuẩn hóa dành cho Dashboard Layout (Admin & Recruiter).
 * Thống nhất theo mẫu thiết kế của /admin/approve/company và tích hợp @animate-ui/react.
 */
export const DashboardPagination: React.FC<DashboardPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  entityLabel = "mục",
  className,
}) => {
  if (totalPages <= 0 || (totalItems !== undefined && totalItems === 0)) {
    return null;
  }

  const hasItemsCount = totalItems !== undefined && pageSize !== undefined;
  const from = hasItemsCount ? (currentPage - 1) * pageSize + 1 : 1;
  const to = hasItemsCount
    ? Math.min(currentPage * pageSize, totalItems)
    : totalItems ?? 0;

  const pages = getPaginationRange(currentPage, totalPages);

  return (
    <div
      className={cn(
        "mt-4 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row",
        className,
      )}
    >
      {/* Thông tin số lượng bên trái */}
      {hasItemsCount ? (
        <span className="text-xs text-text-muted">
          Hiển thị{" "}
          <span className="font-semibold text-slate-700">{from}</span>
          {" - "}
          <span className="font-semibold text-slate-700">{to}</span>
          {" trong tổng số "}
          <span className="font-semibold text-slate-700">{totalItems}</span>
          {` ${entityLabel}`}
        </span>
      ) : (
        <span className="text-xs text-text-muted">
          Trang <span className="font-semibold text-slate-700">{currentPage}</span> /{" "}
          <span className="font-semibold text-slate-700">{totalPages}</span>
        </span>
      )}

      {/* Cụm điều khiển phân trang bên phải */}
      {totalPages > 1 && (
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                disabled={currentPage <= 1}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
              />
            </PaginationItem>

            {pages.map((p, idx) =>
              p === "..." ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      if (p !== currentPage) onPageChange(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                disabled={currentPage >= totalPages}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
