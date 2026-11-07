import { useState, useMemo } from "react";
import { Plus, Pencil, Search, RotateCw } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import { EmptyStreet, EmptyState } from "@/assets/images/decoration";
import {
  useAdminProvinces,
  useAdminWards,
  useUpdateProvince,
  useUpdateWard,
} from "@/hooks/queries/useAdmin";
import { ProvinceDialog } from "../dialogs/ProvinceDialog";
import { WardDialog } from "../dialogs/WardDialog";
import type { AdminProvince, AdminWard } from "@/types/admin";

export function LocationCatalogTab() {
  // ==========================================
  // STATE TỈNH / THÀNH PHỐ (CỘT TRÁI)
  // ==========================================
  const [provinceSearch, setProvinceSearch] = useState("");
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(
    null,
  );
  const [provinceModalOpen, setProvinceModalOpen] = useState(false);
  const [editingProvince, setEditingProvince] = useState<AdminProvince | null>(
    null,
  );

  // ==========================================
  // STATE PHƯỜNG / XÃ (CỘT PHẢI)
  // ==========================================
  const [wardSearch, setWardSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [wardModalOpen, setWardModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<AdminWard | null>(null);

  // ==========================================
  // QUERIES & MUTATIONS
  // ==========================================
  const {
    data: provincesData,
    isLoading: isLoadingProvinces,
    refetch: refetchProvinces,
  } = useAdminProvinces({ pageSize: 100 });

  const provinces = useMemo(() => provincesData?.data || [], [provincesData]);

  // Tự động chọn tỉnh đầu tiên nếu chưa chọn
  const activeProvinceId = useMemo(() => {
    if (
      selectedProvinceId &&
      provinces.some((p) => p.id === selectedProvinceId)
    ) {
      return selectedProvinceId;
    }
    return provinces[0]?.id || null;
  }, [selectedProvinceId, provinces]);

  const activeProvince = useMemo(() => {
    return provinces.find((p) => p.id === activeProvinceId) || null;
  }, [provinces, activeProvinceId]);

  // Query phường/xã con thuộc tỉnh active
  const {
    data: wardsData,
    isLoading: isLoadingWards,
    refetch: refetchWards,
  } = useAdminWards({
    provinceId: activeProvinceId || undefined,
    pageSize: 100,
  });

  const allWards = useMemo(() => wardsData?.data || [], [wardsData]);

  const updateProvinceMutation = useUpdateProvince();
  const updateWardMutation = useUpdateWard();

  // ==========================================
  // LỌC DỮ LIỆU
  // ==========================================
  const filteredProvinces = useMemo(() => {
    if (!provinceSearch.trim()) return provinces;
    const q = provinceSearch.toLowerCase().trim();
    return provinces.filter((p) => p.name.toLowerCase().includes(q));
  }, [provinces, provinceSearch]);

  const filteredWards = useMemo(() => {
    return allWards.filter((w) => {
      const matchSearch =
        !wardSearch.trim() ||
        w.name.toLowerCase().includes(wardSearch.toLowerCase().trim());
      const isWardActive = w.status?.toUpperCase() === "ACTIVE";
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && isWardActive) ||
        (statusFilter === "INACTIVE" && !isWardActive);
      return matchSearch && matchStatus;
    });
  }, [allWards, wardSearch, statusFilter]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleToggleProvinceActive = (
    prov: AdminProvince,
    newActive: boolean,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    updateProvinceMutation.mutate({
      id: prov.id,
      payload: { status: newActive ? "Active" : "Inactive" },
    });
  };

  const handleToggleWardActive = (ward: AdminWard, newActive: boolean) => {
    updateWardMutation.mutate({
      id: ward.id,
      payload: { status: newActive ? "Active" : "Inactive" },
    });
  };

  const handleOpenAddProvince = () => {
    setEditingProvince(null);
    setProvinceModalOpen(true);
  };

  const handleOpenEditProvince = (prov: AdminProvince, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProvince(prov);
    setProvinceModalOpen(true);
  };

  const handleOpenAddWard = () => {
    setEditingWard(null);
    setWardModalOpen(true);
  };

  const handleOpenEditWard = (ward: AdminWard) => {
    setEditingWard(ward);
    setWardModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* 2-COLUMN MASTER-DETAIL LAYOUT */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* ==================================================== */}
        {/* CỘT TRÁI (MASTER): DANH SÁCH TỈNH / THÀNH PHỐ */}
        {/* ==================================================== */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-4 lg:col-span-4 xl:col-span-4">
          {/* Header Cột Trái */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text-main">
                Tỉnh / Thành phố
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-text-muted">
                {provinces.length}
              </span>
            </div>

            <Button
              variant="primary"
              icon={Plus}
              iconSize={15}
              onClick={handleOpenAddProvince}
              className="h-8! rounded-xl! px-3! text-xs! font-semibold!"
            >
              Thêm tỉnh/thành
            </Button>
          </div>

          {/* Ô tìm kiếm tỉnh/thành */}
          <div className="pt-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={provinceSearch}
                onChange={(e) => setProvinceSearch(e.target.value)}
                placeholder="Tìm Tỉnh / Thành phố..."
                className="w-full rounded-xl border border-border bg-bg py-1.5 pr-3 pl-8.5 text-xs text-text-main placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none"
              />
            </div>
          </div>

          {/* Danh sách các Tỉnh / Thành */}
          <div className="mt-3 max-h-[620px] space-y-1.5 overflow-y-auto pr-0.5">
            {isLoadingProvinces ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : filteredProvinces.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                {provinceSearch
                  ? "Không tìm thấy Tỉnh/Thành phố phù hợp"
                  : "Chưa có dữ liệu Tỉnh/Thành phố"}
              </div>
            ) : (
              filteredProvinces.map((prov) => {
                const isSelected = prov.id === activeProvinceId;
                const isProvActive = prov.status?.toUpperCase() === "ACTIVE";
                return (
                  <div
                    key={prov.id}
                    onClick={() => setSelectedProvinceId(prov.id)}
                    className={`group relative flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                      isSelected
                        ? "border-primary bg-secondary-light/40 shadow-xs"
                        : "border-border bg-surface hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Tên & thông tin */}
                    <div className="flex min-w-0 flex-1 flex-col pr-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span
                          className={`truncate text-xs ${
                            isSelected
                              ? "font-semibold text-primary"
                              : "font-semibold text-text-main"
                          }`}
                        >
                          {prov.name}
                        </span>
                        {prov.isCentrallyGoverned && (
                          <span className="shrink-0 rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
                            Trung ương
                          </span>
                        )}
                        {!isProvActive && (
                          <span className="shrink-0 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">
                            Ẩn
                          </span>
                        )}
                      </div>
                      <span className="mt-0.5 text-[11px] text-text-muted">
                        {prov.wardsCount ?? 0} phường / xã
                      </span>
                    </div>

                    {/* Thao tác nhóm: Sửa + Toggle Soft Hide */}
                    <div
                      className="flex shrink-0 items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditProvince(prov, e)}
                              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-slate-100 hover:text-text-main"
                              aria-label="Sửa tỉnh/thành"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                          }
                        />
                        <TooltipPanel
                          side="top"
                          sideOffset={6}
                          className="text-xs"
                        >
                          Chỉnh sửa Tỉnh / Thành
                        </TooltipPanel>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <div>
                              <Switch
                                size="sm"
                                checked={isProvActive}
                                onCheckedChange={(checked) =>
                                  handleToggleProvinceActive(
                                    prov,
                                    checked,
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    { stopPropagation: () => {} } as any,
                                  )
                                }
                                aria-label="Bật/Tắt hoạt động"
                              />
                            </div>
                          }
                        />
                        <TooltipPanel
                          side="top"
                          sideOffset={6}
                          className="text-xs"
                        >
                          {isProvActive
                            ? "Đang bật (Nhấn để ẩn)"
                            : "Đang ẩn (Nhấn để bật)"}
                        </TooltipPanel>
                      </Tooltip>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* CỘT PHẢI (DETAIL): DANH SÁCH PHƯỜNG / XÃ CON */}
        {/* ==================================================== */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-4 lg:col-span-8 xl:col-span-8">
          {/* Header Cột Phải */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text-main">
                {activeProvince
                  ? activeProvince.name
                  : "Phường / Xã trực thuộc"}
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-text-muted">
                {activeProvince ? `${allWards.length} đơn vị` : "0 đơn vị"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                icon={RotateCw}
                iconSize={14}
                onClick={() => refetchWards()}
                disabled={isLoadingWards || !activeProvince}
                className="h-8! rounded-xl! px-2.5! text-xs!"
                title="Làm mới danh sách"
              />

              <Button
                variant="primary"
                icon={Plus}
                iconSize={15}
                onClick={handleOpenAddWard}
                disabled={!activeProvince}
                className="h-8! rounded-xl! px-3! text-xs! font-semibold!"
              >
                Thêm phường/xã
              </Button>
            </div>
          </div>

          {/* Toolbar Lọc Phường/Xã */}
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search input */}
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={wardSearch}
                onChange={(e) => setWardSearch(e.target.value)}
                placeholder="Tìm phường / xã trong tỉnh này..."
                className="w-full rounded-xl border border-border bg-bg py-1.5 pr-3 pl-8.5 text-xs text-text-main placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none"
              />
            </div>

            {/* Filter trạng thái */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-bg p-1">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
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
                onClick={() => setStatusFilter("ACTIVE")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  statusFilter === "ACTIVE"
                    ? "bg-surface text-emerald-600 shadow-xs"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                Đang bật
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("INACTIVE")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  statusFilter === "INACTIVE"
                    ? "bg-surface text-rose-600 shadow-xs"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                Đã ẩn
              </button>
            </div>
          </div>

          {/* Bảng danh sách Phường/Xã */}
          <div className="mt-1 overflow-hidden rounded-xl border border-border">
            {!activeProvince ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <img
                  src={EmptyStreet}
                  alt="Chưa chọn tỉnh/thành"
                  className="mb-3 size-28 object-contain"
                />
                <p className="text-xs font-semibold text-text-main">
                  Chưa có Tỉnh / Thành phố nào được chọn
                </p>
                <p className="mt-1 text-[11px] text-text-muted">
                  Vui lòng thêm hoặc chọn một Tỉnh / Thành phố ở cột bên trái để
                  quản lý danh sách Phường / Xã trực thuộc.
                </p>
              </div>
            ) : isLoadingWards ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-10 animate-pulse rounded-lg bg-slate-100"
                  />
                ))}
              </div>
            ) : filteredWards.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <img
                  src={allWards.length === 0 ? EmptyStreet : EmptyState}
                  alt="Không có dữ liệu"
                  className="mb-3 size-28 object-contain"
                />
                <p className="text-xs font-semibold text-text-main">
                  {allWards.length === 0
                    ? `"${activeProvince.name}" chưa có Phường / Xã nào`
                    : "Không tìm thấy Phường / Xã phù hợp với bộ lọc"}
                </p>
                <p className="mt-1 text-[11px] text-text-muted">
                  {allWards.length === 0
                    ? "Nhấn 'Thêm phường/xã' ở phía trên để tạo đơn vị cơ sở đầu tiên cho địa bàn này."
                    : "Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc trạng thái."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-slate-50/75 text-[11px] font-semibold text-text-muted uppercase">
                      <th className="py-2.5 pr-3 pl-4">Tên Phường / Xã</th>
                      <th className="hidden px-3 py-2.5 sm:table-cell">
                        Phân loại
                      </th>
                      <th className="px-3 py-2.5 text-center">Trạng thái</th>
                      <th className="py-2.5 pr-4 pl-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {filteredWards.map((ward) => {
                      const isWardActive =
                        ward.status?.toUpperCase() === "ACTIVE";
                      return (
                        <tr
                          key={ward.id}
                          className="transition-colors hover:bg-slate-50/60"
                        >
                          {/* Tên: Desktop truncate + tooltip, mobile wrap */}
                          <td className="py-3 pr-3 pl-4">
                            <div className="hidden min-w-0 md:inline-flex">
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="max-w-[260px] truncate font-semibold text-text-main lg:max-w-[340px]">
                                      {ward.name}
                                    </span>
                                  }
                                />
                                <TooltipPanel
                                  side="top"
                                  sideOffset={6}
                                  className="max-w-xs text-xs break-words"
                                >
                                  {ward.name}
                                </TooltipPanel>
                              </Tooltip>
                            </div>
                            <span className="block leading-snug font-semibold break-words whitespace-normal text-text-main md:hidden">
                              {ward.name}
                            </span>
                          </td>

                          {/* Phân loại: Xã vs Phường/Thị trấn */}
                          <td className="hidden px-3 py-3 text-text-muted sm:table-cell">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                                ward.isCommune
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {ward.isCommune ? "Xã" : "Phường"}
                            </span>
                          </td>

                          {/* Trạng thái Soft Hide */}
                          <td className="px-3 py-3 text-center">
                            <div className="inline-flex items-center gap-2">
                              <Switch
                                size="sm"
                                checked={isWardActive}
                                onCheckedChange={(checked) =>
                                  handleToggleWardActive(ward, checked)
                                }
                                aria-label="Bật/Tắt hoạt động"
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
                                    onClick={() => handleOpenEditWard(ward)}
                                    className="inline-flex items-center justify-center rounded-lg p-1.5 text-text-muted transition-colors hover:bg-slate-100 hover:text-text-main"
                                    aria-label="Chỉnh sửa phường/xã"
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
                                Chỉnh sửa Phường / Xã
                              </TooltipPanel>
                            </Tooltip>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* DIALOGS ANIMATE-UI */}
      {/* ==================================================== */}
      <ProvinceDialog
        open={provinceModalOpen}
        onOpenChange={setProvinceModalOpen}
        province={editingProvince}
        onSuccess={() => refetchProvinces()}
      />

      <WardDialog
        open={wardModalOpen}
        onOpenChange={setWardModalOpen}
        ward={editingWard}
        defaultProvinceId={activeProvinceId || undefined}
        provinces={provinces}
        onSuccess={() => {
          refetchWards();
          refetchProvinces();
        }}
      />
    </div>
  );
}
