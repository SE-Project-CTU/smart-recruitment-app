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
  useAdminIndustryGroups,
  useAdminIndustries,
  useUpdateIndustryGroup,
  useUpdateIndustry,
} from "@/hooks/queries/useAdmin";
import { IndustryGroupDialog } from "../dialogs/IndustryGroupDialog";
import { IndustryDialog } from "../dialogs/IndustryDialog";
import type { AdminIndustry, AdminIndustryGroup } from "@/types/admin";

export function IndustryCatalogTab() {
  // ==========================================
  // STATE NHÓM NGÀNHs (CỘT TRÁI)
  // ==========================================
  const [groupSearch, setGroupSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AdminIndustryGroup | null>(
    null,
  );

  // ==========================================
  // STATE NGÀNH NGHỀ CON (CỘT PHẢI)
  // ==========================================
  const [industrySearch, setIndustrySearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [industryModalOpen, setIndustryModalOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<AdminIndustry | null>(
    null,
  );

  // ==========================================
  // QUERIES & MUTATIONS
  // ==========================================
  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    refetch: refetchGroups,
  } = useAdminIndustryGroups({ pageSize: 100 });

  const groups = useMemo(() => groupsData?.data || [], [groupsData]);

  // Tự động chọn nhóm ngành đầu tiên nếu chưa chọn
  const activeGroupId = useMemo(() => {
    if (selectedGroupId && groups.some((g) => g.id === selectedGroupId)) {
      return selectedGroupId;
    }
    return groups[0]?.id || null;
  }, [selectedGroupId, groups]);

  const activeGroup = useMemo(() => {
    return groups.find((g) => g.id === activeGroupId) || null;
  }, [groups, activeGroupId]);

  // Query ngành nghề con thuộc nhóm active
  const {
    data: industriesData,
    isLoading: isLoadingIndustries,
    refetch: refetchIndustries,
  } = useAdminIndustries({
    groupId: activeGroupId || undefined,
    pageSize: 100,
  });

  const allIndustries = useMemo(
    () => industriesData?.data || [],
    [industriesData],
  );

  const updateGroupMutation = useUpdateIndustryGroup();
  const updateIndustryMutation = useUpdateIndustry();

  // ==========================================
  // LỌC DỮ LIỆU
  // ==========================================
  // Lọc nhóm ngành theo từ khóa tìm kiếm
  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return groups;
    const q = groupSearch.toLowerCase().trim();
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, groupSearch]);

  // Lọc ngành nghề con theo từ khóa và trạng thái
  const filteredIndustries = useMemo(() => {
    return allIndustries.filter((ind) => {
      const matchSearch =
        !industrySearch.trim() ||
        ind.name.toLowerCase().includes(industrySearch.toLowerCase().trim());
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && ind.isActive) ||
        (statusFilter === "INACTIVE" && !ind.isActive);
      return matchSearch && matchStatus;
    });
  }, [allIndustries, industrySearch, statusFilter]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleToggleGroupActive = (
    group: AdminIndustryGroup,
    newActive: boolean,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    updateGroupMutation.mutate({
      id: group.id,
      payload: { isActive: newActive },
    });
  };

  const handleToggleIndustryActive = (
    industry: AdminIndustry,
    newActive: boolean,
  ) => {
    updateIndustryMutation.mutate({
      id: industry.id,
      payload: { isActive: newActive },
    });
  };

  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setGroupModalOpen(true);
  };

  const handleOpenEditGroup = (
    group: AdminIndustryGroup,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setEditingGroup(group);
    setGroupModalOpen(true);
  };

  const handleOpenAddIndustry = () => {
    setEditingIndustry(null);
    setIndustryModalOpen(true);
  };

  const handleOpenEditIndustry = (industry: AdminIndustry) => {
    setEditingIndustry(industry);
    setIndustryModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* 2-COLUMN MASTER-DETAIL LAYOUT */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* ==================================================== */}
        {/* CỘT TRÁI (MASTER): DANH SÁCH NHÓM NGÀNH */}
        {/* ==================================================== */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-4 lg:col-span-4 xl:col-span-4">
          {/* Header Cột Trái */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text-main">
                Nhóm ngành
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-text-muted">
                {groups.length}
              </span>
            </div>

            <Button
              variant="primary"
              icon={Plus}
              iconSize={15}
              onClick={handleOpenAddGroup}
              className="h-8! px-3! text-xs! font-semibold! rounded-xl!"
            >
              Thêm nhóm
            </Button>
          </div>

          {/* Ô tìm kiếm nhóm ngành */}
          <div className="pt-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                placeholder="Tìm nhóm ngành..."
                className="w-full rounded-xl border border-border bg-bg py-1.5 pr-3 pl-8.5 text-xs text-text-main placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none"
              />
            </div>
          </div>

          {/* Danh sách các nhóm ngành */}
          <div className="mt-3 max-h-[620px] space-y-1.5 overflow-y-auto pr-0.5">
            {isLoadingGroups ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                {groupSearch
                  ? "Không tìm thấy nhóm ngành phù hợp"
                  : "Chưa có nhóm ngành nào"}
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isSelected = group.id === activeGroupId;
                return (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`group relative flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                      isSelected
                        ? "border-primary bg-secondary-light/40 shadow-xs"
                        : "border-border bg-surface hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Tên nhóm & số ngành con */}
                    <div className="flex min-w-0 flex-1 flex-col pr-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span
                          className={`truncate text-xs ${
                            isSelected
                              ? "font-semibold text-primary"
                              : "font-semibold text-text-main"
                          }`}
                        >
                          {group.name}
                        </span>
                        {!group.isActive && (
                          <span className="shrink-0 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">
                            Ẩn
                          </span>
                        )}
                      </div>
                      <span className="mt-0.5 text-[11px] text-text-muted">
                        {group.industriesCount ?? 0} ngành nghề con
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
                              onClick={(e) => handleOpenEditGroup(group, e)}
                              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-slate-100 hover:text-text-main"
                              aria-label="Sửa nhóm"
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
                          Chỉnh sửa tên nhóm
                        </TooltipPanel>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <div>
                              <Switch
                                size="sm"
                                checked={group.isActive}
                                onCheckedChange={(checked) =>
                                  handleToggleGroupActive(
                                    group,
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
                          {group.isActive
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
        {/* CỘT PHẢI (DETAIL): DANH SÁCH NGÀNH NGHỀ CON */}
        {/* ==================================================== */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-4 lg:col-span-8 xl:col-span-8">
          {/* Header Cột Phải */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text-main">
                {activeGroup ? activeGroup.name : "Ngành nghề trực thuộc"}
              </h2>

              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-text-muted">
                {activeGroup ? `${allIndustries.length} ngành` : "0 ngành"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                icon={RotateCw}
                iconSize={14}
                onClick={() => refetchIndustries()}
                disabled={isLoadingIndustries || !activeGroup}
                className="h-8! px-2.5! text-xs! rounded-xl!"
                title="Làm mới danh sách"
              />

              <Button
                variant="primary"
                icon={Plus}
                iconSize={15}
                onClick={handleOpenAddIndustry}
                disabled={!activeGroup}
                className="h-8! px-3! text-xs! font-semibold! rounded-xl!"
              >
                Thêm ngành nghề
              </Button>
            </div>
          </div>

          {/* Toolbar Lọc Ngành nghề */}
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search input */}
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={industrySearch}
                onChange={(e) => setIndustrySearch(e.target.value)}
                placeholder="Tìm ngành nghề trong nhóm này..."
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

          {/* Bảng danh sách ngành nghề con */}
          <div className="mt-1 overflow-hidden rounded-xl border border-border">
            {!activeGroup ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <img
                  src={EmptyStreet}
                  alt="Chưa chọn nhóm ngành"
                  className="mb-3 size-28 object-contain"
                />
                <p className="text-xs font-semibold text-text-main">
                  Chưa có nhóm ngành nào được chọn
                </p>
                <p className="mt-1 text-[11px] text-text-muted">
                  Vui lòng thêm hoặc chọn một nhóm ngành ở cột bên trái để xem và quản lý các ngành nghề trực thuộc.
                </p>
              </div>
            ) : isLoadingIndustries ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-10 animate-pulse rounded-lg bg-slate-100"
                  />
                ))}
              </div>
            ) : filteredIndustries.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <img
                  src={allIndustries.length === 0 ? EmptyStreet : EmptyState}
                  alt="Không có dữ liệu"
                  className="mb-3 size-28 object-contain"
                />
                <p className="text-xs font-semibold text-text-main">
                  {allIndustries.length === 0
                    ? `Nhóm "${activeGroup?.name || "này"}" chưa có ngành nghề nào`
                    : "Không tìm thấy ngành nghề phù hợp với bộ lọc"}
                </p>
                <p className="mt-1 text-[11px] text-text-muted">
                  {allIndustries.length === 0
                    ? "Nhấn 'Thêm ngành nghề' ở phía trên để tạo ngành nghề đầu tiên cho nhóm này."
                    : "Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc trạng thái."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-slate-50/75 text-[11px] font-semibold text-text-muted uppercase">
                      <th className="py-2.5 pr-3 pl-4">Tên ngành nghề</th>
                      <th className="hidden px-3 py-2.5 sm:table-cell">
                        Nhóm ngành
                      </th>
                      <th className="px-3 py-2.5 text-center">Trạng thái</th>
                      <th className="py-2.5 pr-4 pl-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {filteredIndustries.map((ind) => (
                      <tr
                        key={ind.id}
                        className="transition-colors hover:bg-slate-50/60"
                      >
                        {/* Tên ngành nghề: Wrap mobile, Truncate desktop */}
                        <td className="py-3 pr-3 pl-4">
                          <div className="hidden min-w-0 md:inline-flex">
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <span className="max-w-[280px] truncate font-semibold text-text-main lg:max-w-[340px]">
                                    {ind.name}
                                  </span>
                                }
                              />
                              <TooltipPanel
                                side="top"
                                sideOffset={6}
                                className="max-w-xs text-xs break-words"
                              >
                                {ind.name}
                              </TooltipPanel>
                            </Tooltip>
                          </div>
                          <span className="block leading-snug font-semibold break-words whitespace-normal text-text-main md:hidden">
                            {ind.name}
                          </span>
                        </td>

                        {/* Nhóm ngành cha */}
                        <td className="hidden px-3 py-3 text-text-muted sm:table-cell">
                          {ind.groupName || activeGroup?.name}
                        </td>

                        {/* Trạng thái Soft Hide (Switch + Badge) */}
                        <td className="px-3 py-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <Switch
                              size="sm"
                              checked={ind.isActive}
                              onCheckedChange={(checked) =>
                                handleToggleIndustryActive(ind, checked)
                              }
                              aria-label="Chuyển trạng thái hoạt động"
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
                                  onClick={() => handleOpenEditIndustry(ind)}
                                  className="inline-flex items-center justify-center rounded-lg p-1.5 text-text-muted transition-colors hover:bg-slate-100 hover:text-text-main"
                                  aria-label="Chỉnh sửa ngành"
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
                              Chỉnh sửa ngành nghề
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
        </div>
      </div>

      {/* ==================================================== */}
      {/* DIALOGS ANIMATE-UI */}
      {/* ==================================================== */}
      <IndustryGroupDialog
        open={groupModalOpen}
        onOpenChange={setGroupModalOpen}
        group={editingGroup}
        onSuccess={() => {
          refetchGroups();
        }}
      />

      <IndustryDialog
        open={industryModalOpen}
        onOpenChange={setIndustryModalOpen}
        industry={editingIndustry}
        defaultGroupId={activeGroupId || undefined}
        groups={groups}
        onSuccess={() => {
          refetchIndustries();
          refetchGroups();
        }}
      />
    </div>
  );
}
