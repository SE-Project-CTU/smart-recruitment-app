import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Search,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";

import { Button } from "@/components/common/Button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import { EmptyStreet, EmptyState } from "@/assets/images/decoration";
import { useAdminSkills, useUpdateSkill } from "@/hooks/queries/useAdmin";
import { SkillDialog } from "../dialogs/SkillDialog";
import type { AdminSkill } from "@/types/admin";

export function SkillCatalogTab() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<AdminSkill | null>(null);

  // Tham số truy vấn API
  const queryParams = useMemo(() => {
    return {
      search: debouncedSearch.trim() || undefined,
      isActive: statusFilter === "ALL" ? undefined : statusFilter === "ACTIVE",
      page,
      pageSize,
    };
  }, [debouncedSearch, statusFilter, page, pageSize]);

  const {
    data: skillsResponse,
    isLoading,
    refetch,
  } = useAdminSkills(queryParams);

  const skills = useMemo(() => skillsResponse?.data || [], [skillsResponse]);
  const meta = skillsResponse?.meta;
  const totalCount = meta?.totalItems ?? 0;
  const totalPages = meta?.totalPages ?? Math.ceil(totalCount / pageSize) ?? 1;

  const updateSkillMutation = useUpdateSkill();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (!val.trim()) {
      setDebouncedSearch("");
      setPage(1);
    }
  };

  const handleStatusFilterChange = (status: "ALL" | "ACTIVE" | "INACTIVE") => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleToggleActive = (skill: AdminSkill, newActive: boolean) => {
    updateSkillMutation.mutate({
      id: skill.id,
      payload: { isActive: newActive },
    });
  };

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (skill: AdminSkill) => {
    setEditingSkill(skill);
    setDialogOpen(true);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* THẺ CHÍNH CHỨA BẢNG KỸ NĂNG */}
      <div className="flex flex-col rounded-2xl border border-border bg-surface p-4 sm:p-5">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text-main">
              Ngân hàng kỹ năng
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-text-muted">
              {totalCount} kỹ năng
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={RotateCw}
              iconSize={14}
              onClick={() => refetch()}
              disabled={isLoading}
              className="h-8! rounded-xl! px-2.5! text-xs!"
              title="Làm mới danh sách"
            />

            <Button
              variant="primary"
              icon={Plus}
              iconSize={15}
              onClick={handleOpenAdd}
              className="h-8! rounded-xl! px-3! text-xs!"
            >
              Thêm kỹ năng
            </Button>
          </div>
        </div>

        {/* Thanh tìm kiếm & Bộ lọc trạng thái */}
        <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Ô tìm kiếm */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative max-w-sm flex-1"
          >
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm theo tên kỹ năng..."
              className="w-full rounded-xl border border-border bg-bg py-1.5 pr-3 pl-8.5 text-xs text-text-main placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none"
            />
          </form>

          {/* Bộ lọc trạng thái hoạt động */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-bg p-1">
            <button
              type="button"
              onClick={() => handleStatusFilterChange("ALL")}
              className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                statusFilter === "ALL"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => handleStatusFilterChange("ACTIVE")}
              className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                statusFilter === "ACTIVE"
                  ? "bg-surface"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Đang bật
            </button>
            <button
              type="button"
              onClick={() => handleStatusFilterChange("INACTIVE")}
              className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                statusFilter === "INACTIVE"
                  ? "bg-surface"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Đã ẩn
            </button>
          </div>
        </div>

        {/* Danh sách / Bảng kỹ năng */}
        <div className="mt-1 overflow-hidden rounded-xl border border-border">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="h-11 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <img
                src={
                  debouncedSearch || statusFilter !== "ALL"
                    ? EmptyState
                    : EmptyStreet
                }
                alt="Không có dữ liệu"
                className="mb-3 size-28 object-contain"
              />
              <p className="text-xs text-text-main">
                {debouncedSearch || statusFilter !== "ALL"
                  ? "Không tìm thấy kỹ năng nào phù hợp với bộ lọc"
                  : "Ngân hàng kỹ năng hiện đang trống"}
              </p>
              <p className="mt-1 text-[11px] text-text-muted">
                {debouncedSearch || statusFilter !== "ALL"
                  ? "Hãy thử tìm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh sách."
                  : "Nhấn 'Thêm kỹ năng' ở góc trên để tạo kỹ năng chuẩn hóa đầu tiên."}
              </p>
              {(debouncedSearch || statusFilter !== "ALL") && (
                <Button
                  variant="secondary"
                  onClick={handleClearFilters}
                  className="mt-3 h-8! rounded-xl! px-3! text-xs!"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-slate-50/75 text-[11px] text-text-muted uppercase">
                    <th className="py-2.5 pr-3 pl-4">Tên kỹ năng</th>
                    <th className="hidden px-3 py-2.5 sm:table-cell">
                      Ngày tạo
                    </th>
                    <th className="px-3 py-2.5 text-center">Trạng thái</th>
                    <th className="py-2.5 pr-4 pl-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {skills.map((skill) => (
                    <tr
                      key={skill.id}
                      className="transition-colors hover:bg-slate-50/60"
                    >
                      {/* Tên kỹ năng: Desktop truncate + tooltip, mobile wrap */}
                      <td className="py-3 pr-3 pl-4">
                        <div className="hidden min-w-0 md:inline-flex">
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="max-w-70 truncate text-text-main lg:max-w-100">
                                  {skill.name}
                                </span>
                              }
                            />
                            <TooltipPanel
                              side="top"
                              sideOffset={6}
                              className="max-w-xs text-xs wrap-break-word"
                            >
                              {skill.name}
                            </TooltipPanel>
                          </Tooltip>
                        </div>
                        <span className="block leading-snug wrap-break-word whitespace-normal text-text-main md:hidden">
                          {skill.name}
                        </span>
                      </td>

                      {/* Ngày tạo */}
                      <td className="hidden px-3 py-3 text-text-muted sm:table-cell">
                        {skill.createdAt
                          ? dayjs(skill.createdAt).format("DD/MM/YYYY HH:mm")
                          : "—"}
                      </td>

                      {/* Trạng thái Soft Hide (Switch + Badge) */}
                      <td className="px-3 py-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <Switch
                            size="sm"
                            checked={skill.isActive}
                            onCheckedChange={(checked) =>
                              handleToggleActive(skill, checked)
                            }
                            aria-label="Bật/Tắt trạng thái hoạt động"
                          />
                        </div>
                      </td>

                      {/* Thao tác: Nút sửa */}
                      <td className="py-3 pr-4 pl-3 text-right">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(skill)}
                                className="inline-flex items-center justify-center rounded-lg p-1.5 text-text-muted transition-colors hover:bg-slate-100 hover:text-text-main"
                                aria-label="Chỉnh sửa kỹ năng"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                            }
                          />
                          <TooltipPanel
                            side="left"
                            sideOffset={6}
                            className="text-xs"
                          >
                            Chỉnh sửa tên kỹ năng
                          </TooltipPanel>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Thanh Phân trang 1-based */}
        {totalCount > 0 && (
          <div className="mt-3 flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
            <span className="text-xs text-text-muted">
              Hiển thị{" "}
              <span className="text-text-main">
                {Math.min((page - 1) * pageSize + 1, totalCount)}
              </span>{" "}
              -{" "}
              <span className="text-text-main">
                {Math.min(page * pageSize, totalCount)}
              </span>{" "}
              trong tổng số <span className="text-text-main">{totalCount}</span>{" "}
              kỹ năng
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                icon={ChevronLeft}
                iconSize={14}
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="h-8! rounded-xl! px-2.5! text-xs!"
              >
                Trước
              </Button>

              <span className="px-2 text-xs text-text-main">
                {page} / {totalPages || 1}
              </span>

              <Button
                variant="secondary"
                icon={ChevronRight}
                iconPosition="right"
                iconSize={14}
                disabled={page >= totalPages || isLoading}
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="h-8! rounded-xl! px-2.5! text-xs!"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* DIALOG THÊM / SỬA KỸ NĂNG */}
      <SkillDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        skill={editingSkill}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
