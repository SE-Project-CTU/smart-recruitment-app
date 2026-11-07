import { useState, useMemo } from "react";
import {
  Pencil,
  Search,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { CVTemplateCard } from "@/components/common/CVTemplateCard";
import type { CVTemplateItemData } from "@/components/common/CVTemplateCard";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import { EmptyStreet, EmptyState } from "@/assets/images/decoration";
import {
  useAdminCvTemplates,
  useUpdateCvTemplate,
} from "@/hooks/queries/useAdmin";
import { CvTemplateDialog } from "../dialogs/CvTemplateDialog";
import { PreviewTemplateModal } from "@/pages/candidate/components/CvTemplates/PreviewTemplateModal";
import type { AdminCvTemplateItem } from "@/types/admin";

export function CvTemplateCatalogTab() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<AdminCvTemplateItem | null>(null);
  const [previewTemplate, setPreviewTemplate] =
    useState<CVTemplateItemData | null>(null);

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
    data: templatesResponse,
    isLoading,
    refetch,
  } = useAdminCvTemplates(queryParams);

  const templates = useMemo(
    () => templatesResponse?.data || [],
    [templatesResponse],
  );
  const meta = templatesResponse?.meta;
  const totalCount = meta?.totalItems ?? 0;
  const totalPages = meta?.totalPages ?? Math.ceil(totalCount / pageSize) ?? 1;

  const updateMutation = useUpdateCvTemplate();

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

  const handleToggleActive = (
    template: AdminCvTemplateItem,
    newActive: boolean,
  ) => {
    updateMutation.mutate({
      id: template.id,
      payload: { isActive: newActive },
    });
  };

  const handleOpenEdit = (template: AdminCvTemplateItem) => {
    setEditingTemplate(template);
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
      {/* KHỐI NỘI DUNG CHÍNH */}
      <div className="flex flex-col rounded-2xl border border-border bg-surface p-4 sm:p-5">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text-main">
              Kho mẫu CV chuẩn hóa
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-text-muted">
              {totalCount} mẫu
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
              placeholder="Tìm theo tên hoặc mã mẫu CV..."
              className="w-full rounded-xl border border-border bg-bg py-1.5 pr-3 pl-8.5 text-xs text-text-main placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none"
            />
          </form>

          {/* Bộ lọc trạng thái hoạt động */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-bg p-1">
            <button
              type="button"
              onClick={() => handleStatusFilterChange("ALL")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
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
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                statusFilter === "ACTIVE"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Đang bật
            </button>
            <button
              type="button"
              onClick={() => handleStatusFilterChange("INACTIVE")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                statusFilter === "INACTIVE"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Đã ẩn
            </button>
          </div>
        </div>

        {/* Danh sách Mẫu CV (Dạng Grid chuẩn CVTemplateCard từ Candidate) */}
        <div className="mt-3">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-3/4 animate-pulse rounded-2xl border border-border bg-slate-100"
                />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <img
                src={
                  debouncedSearch || statusFilter !== "ALL"
                    ? EmptyState
                    : EmptyStreet
                }
                alt="Không có dữ liệu"
                className="mb-3 size-28 object-contain"
              />
              <p className="text-xs font-semibold text-text-main">
                {debouncedSearch || statusFilter !== "ALL"
                  ? "Không tìm thấy mẫu CV nào phù hợp với bộ lọc"
                  : "Kho mẫu CV hiện đang trống"}
              </p>
              <p className="mt-1 text-[11px] text-text-muted">
                {debouncedSearch || statusFilter !== "ALL"
                  ? "Hãy thử thay đổi từ khóa hoặc bỏ lọc trạng thái để xem toàn bộ danh sách."
                  : "Hệ thống sẽ cập nhật thêm các mẫu CV tiêu chuẩn sớm nhất."}
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {templates.map((tpl) => {
                const isTplActive = tpl.isActive;
                const cardData: CVTemplateItemData = {
                  id: tpl.id,
                  name: tpl.name,
                  description: tpl.description,
                  thumbnailUrl: tpl.thumbnailUrl || undefined,
                  badge: isTplActive ? "Chuẩn ATS" : undefined,
                  version: tpl.version,
                  isActive: isTplActive,
                  language: tpl.language,
                };

                return (
                  <CVTemplateCard
                    key={tpl.id}
                    template={cardData}
                    onPreview={(item) => setPreviewTemplate(item)}
                    onEdit={() => handleOpenEdit(tpl)}
                    topRightBadge={
                      <div className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-text-muted shadow-xs backdrop-blur-xs">
                        <span>v{tpl.version}</span>
                        <span className="text-border">•</span>
                        <span className="font-semibold text-text-main">
                          {tpl.language?.toUpperCase() || "VI"}
                        </span>
                      </div>
                    }
                    footerExtra={
                      <div className="flex items-center justify-between">
                        {/* Switch Soft Hide */}
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <div>
                                  <Switch
                                    size="sm"
                                    checked={isTplActive}
                                    onCheckedChange={(checked) =>
                                      handleToggleActive(tpl, checked)
                                    }
                                    aria-label="Kích hoạt mẫu CV"
                                  />
                                </div>
                              }
                            />
                            <TooltipPanel
                              side="top"
                              sideOffset={6}
                              className="text-xs"
                            >
                              {isTplActive
                                ? "Đang kích hoạt (Nhấn để ẩn)"
                                : "Đã ẩn (Nhấn để bật)"}
                            </TooltipPanel>
                          </Tooltip>
                          <span
                            className={`text-xs font-medium ${
                              isTplActive ? "text-text-main" : "text-text-muted"
                            }`}
                          >
                            {isTplActive ? "Kích hoạt" : "Đã ẩn"}
                          </span>
                        </div>

                        {/* Nút sửa nhanh */}
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(tpl)}
                                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-slate-200/60 hover:text-text-main"
                                aria-label="Chỉnh sửa mẫu CV"
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
                            Chỉnh sửa thông tin mẫu CV
                          </TooltipPanel>
                        </Tooltip>
                      </div>
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Thanh Phân trang 1-based */}
        {totalCount > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
            <span className="text-xs text-text-muted">
              Hiển thị{" "}
              <span className="font-semibold text-text-main">
                {Math.min((page - 1) * pageSize + 1, totalCount)}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-text-main">
                {Math.min(page * pageSize, totalCount)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-text-main">{totalCount}</span>{" "}
              mẫu CV
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

              <span className="px-2 text-xs font-semibold text-text-main">
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

      {/* DIALOG CHỈNH SỬA MẪU CV */}
      <CvTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        onSuccess={() => refetch()}
      />

      {/* MODAL XEM TRƯỚC MẪU CV A4 (TẬN DỤNG TỪ CANDIDATE) */}
      <PreviewTemplateModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </div>
  );
}
