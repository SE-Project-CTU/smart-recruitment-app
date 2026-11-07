import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Search,
  X,
  RotateCw,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Shield,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";

import { Select } from "@animate-ui/react/primitives/base-ui/select";
import {
  Button,
  DataTable,
  type DataTableFeatures,
  TableSkeleton,
} from "@/components/common";
import { UserAvatar } from "@/components/common/UserAvatar";
import { EmptyStreet } from "@/assets/images/decoration";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useAdminUsers,
  useUpdateUserStatus,
  useAdminDashboardOverview,
} from "@/hooks/queries/useAdmin";
import { useAuthStore } from "@/stores/authStore";
import type { AdminUserItem } from "@/types/admin";
import { cn } from "@/lib/utils";

dayjs.locale("vi");

type RoleTabKey = "ALL" | "Candidate" | "Recruiter" | "Admin";

interface RoleTabConfig {
  key: RoleTabKey;
  label: string;
}

const ROLE_TABS: RoleTabConfig[] = [
  { key: "ALL", label: "Tất cả vai trò" },
  { key: "Candidate", label: "Ứng viên" },
  { key: "Recruiter", label: "Nhà tuyển dụng" },
  { key: "Admin", label: "Quản trị viên" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "Active", label: "Đang hoạt động" },
  { value: "Locked", label: "Đã bị khóa" },
  { value: "Inactive", label: "Chưa kích hoạt" },
];

const ROLE_BADGE_CONFIG: Record<string, { label: string; badgeClass: string }> =
  {
    Admin: {
      label: "Quản trị viên",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    },
    Recruiter: {
      label: "Nhà tuyển dụng",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    },
    Candidate: {
      label: "Ứng viên",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  };

const STATUS_BADGE_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: typeof CheckCircle2 }
> = {
  Active: {
    label: "Hoạt động",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  Locked: {
    label: "Bị khóa",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    icon: Lock,
  },
  Inactive: {
    label: "Chưa kích hoạt",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Clock,
  },
};

const columnHelper = createColumnHelper<DataTableFeatures, AdminUserItem>();

export default function AdminUserManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = useAuthStore((s) => s.user);

  // Đọc params từ URL
  const activeRoleTab = (searchParams.get("role") || "ALL") as RoleTabKey;
  const activeStatus = searchParams.get("status") || "ALL";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const pageSize = 10;

  // Local state cho search input
  const [searchInput, setSearchInput] = useState(search);

  // Dialog xác nhận Khóa tài khoản
  const [lockTarget, setLockTarget] = useState<AdminUserItem | null>(null);
  const [lockReason, setLockReason] = useState("");

  // Dialog xác nhận Mở khóa tài khoản
  const [unlockTarget, setUnlockTarget] = useState<AdminUserItem | null>(null);

  const updateUserStatusMutation = useUpdateUserStatus();

  // Lấy tổng quan số lượng
  const { data: overview } = useAdminDashboardOverview();

  // Xác định params query
  const queryRole = activeRoleTab === "ALL" ? undefined : activeRoleTab;
  const queryStatus = activeStatus === "ALL" ? undefined : activeStatus;

  // Query danh sách người dùng
  const {
    data: pagedResponse,
    isLoading,
    isRefetching,
    refetch,
  } = useAdminUsers({
    role: queryRole,
    status: queryStatus,
    search: search || undefined,
    page,
    pageSize,
  });

  const users = pagedResponse?.data ?? [];
  const meta = pagedResponse?.meta;
  const totalItems = meta?.totalItems ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  // Cập nhật URL search params an toàn
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "ALL") {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    setSearchParams(next);
  };

  const handleRoleTabChange = (roleKey: RoleTabKey) => {
    updateParams({ role: roleKey, page: "1" });
  };

  const handleStatusChange = (statusValue: string) => {
    updateParams({ status: statusValue, page: "1" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim(), page: "1" });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateParams({ search: null, page: "1" });
  };

  const handleClearAllFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  // Xác nhận khóa tài khoản
  const handleConfirmLock = async () => {
    if (!lockTarget) return;
    try {
      await updateUserStatusMutation.mutateAsync({
        id: lockTarget.id,
        payload: {
          status: "Locked",
          reason: lockReason.trim() || undefined,
        },
      });
      setLockTarget(null);
      setLockReason("");
    } catch {
      // Toast error đã được xử lý tự động trong mutation hook
    }
  };

  // Xác nhận mở khóa tài khoản
  const handleConfirmUnlock = async () => {
    if (!unlockTarget) return;
    try {
      await updateUserStatusMutation.mutateAsync({
        id: unlockTarget.id,
        payload: {
          status: "Active",
        },
      });
      setUnlockTarget(null);
    } catch {
      // Toast error đã được xử lý tự động trong mutation hook
    }
  };

  // Cấu hình các cột cho DataTable với sort built-in
  const columns = useMemo(
    () =>
      columnHelper.columns([
        // Cột 1: Thông tin người dùng & Avatar (sortable by fullName)
        columnHelper.accessor("fullName", {
          id: "fullName",
          header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return (
              <button
                type="button"
                onClick={() => column.toggleSorting(isSorted === "asc")}
                className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-slate-600 transition-colors hover:text-primary"
              >
                <span>Người dùng</span>
                {isSorted === "asc" ? (
                  <ArrowUp className="size-3 text-primary" />
                ) : isSorted === "desc" ? (
                  <ArrowDown className="size-3 text-primary" />
                ) : (
                  <ArrowUpDown className="size-3 text-slate-400 opacity-60" />
                )}
              </button>
            );
          },
          cell: ({ row }) => {
            const u = row.original;
            const isCurrent = currentUser?.id === u.id;
            return (
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={u.fullName}
                  src={u.avatarUrl || ""}
                  className="h-9 w-9 shrink-0 rounded-md ring-1 ring-border"
                />
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-semibold text-text-main">
                      {u.fullName}
                    </span>
                    {isCurrent && (
                      <span className="py-0.2 rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                        Bạn
                      </span>
                    )}
                  </div>
                  <span className="truncate text-[11px] text-text-muted">
                    {u.email}
                  </span>
                </div>
              </div>
            );
          },
        }),

        // Cột 2: Số điện thoại
        columnHelper.accessor("phone", {
          id: "phone",
          header: "Số điện thoại",
          cell: ({ row }) => {
            const phone = row.original.phone;
            return (
              <span className="text-xs text-slate-600">
                {phone || <span className="text-slate-400">—</span>}
              </span>
            );
          },
        }),

        // Cột 3: Vai trò
        columnHelper.display({
          id: "roles",
          header: "Vai trò",
          cell: ({ row }) => {
            const roles = row.original.roles;
            return (
              <div className="flex flex-wrap items-center gap-1">
                {roles && roles.length > 0 ? (
                  roles.map((r) => {
                    const badge = ROLE_BADGE_CONFIG[r] ?? {
                      label: r,
                      badgeClass:
                        "bg-slate-100 text-slate-700 border-slate-200",
                    };
                    return (
                      <span
                        key={r}
                        className={cn(
                          "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                          badge.badgeClass,
                        )}
                      >
                        {badge.label}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
            );
          },
        }),

        // Cột 4: Trạng thái (sortable by status)
        columnHelper.accessor("status", {
          id: "status",
          header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return (
              <button
                type="button"
                onClick={() => column.toggleSorting(isSorted === "asc")}
                className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-slate-600 transition-colors hover:text-primary"
              >
                <span>Trạng thái</span>
                {isSorted === "asc" ? (
                  <ArrowUp className="size-3 text-primary" />
                ) : isSorted === "desc" ? (
                  <ArrowDown className="size-3 text-primary" />
                ) : (
                  <ArrowUpDown className="size-3 text-slate-400 opacity-60" />
                )}
              </button>
            );
          },
          cell: ({ row }) => {
            const statusKey = row.original.status ?? "Active";
            const statusConfig =
              STATUS_BADGE_CONFIG[statusKey] ?? STATUS_BADGE_CONFIG.Active;
            const StatusIcon = statusConfig.icon;
            return (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
                  statusConfig.badgeClass,
                )}
              >
                <StatusIcon className="size-3" />
                {statusConfig.label}
              </span>
            );
          },
        }),

        // Cột 5: Ngày tham gia (sortable by createdAt)
        columnHelper.accessor("createdAt", {
          id: "createdAt",
          header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return (
              <button
                type="button"
                onClick={() => column.toggleSorting(isSorted === "asc")}
                className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-slate-600 transition-colors hover:text-primary"
              >
                <span>Ngày tham gia</span>
                {isSorted === "asc" ? (
                  <ArrowUp className="size-3 text-primary" />
                ) : isSorted === "desc" ? (
                  <ArrowDown className="size-3 text-primary" />
                ) : (
                  <ArrowUpDown className="size-3 text-slate-400 opacity-60" />
                )}
              </button>
            );
          },
          cell: ({ row }) => {
            const createdAt = row.original.createdAt;
            return (
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-slate-700">
                  {dayjs(createdAt).format("DD/MM/YYYY")}
                </span>
                <span className="text-[11px] text-slate-400">
                  {dayjs(createdAt).format("HH:mm")}
                </span>
              </div>
            );
          },
        }),

        // Cột 6: Thao tác (Button icon không label)
        columnHelper.display({
          id: "actions",
          header: () => (
            <div className="text-right font-semibold">Thao tác</div>
          ),
          meta: { className: "text-right" },
          cell: ({ row }) => {
            const u = row.original;
            const isCurrent = currentUser?.id === u.id;
            return (
              <div className="flex items-center justify-end gap-1">
                {isCurrent ? (
                  <Button
                    variant="secondary"
                    icon={Shield}
                    iconSize={14}
                    disabled
                    title="Không thể tự khóa tài khoản của chính bạn"
                    className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-slate-300! shadow-none! ring-0!"
                  />
                ) : u.status === "Locked" ? (
                  <Button
                    variant="primary"
                    icon={Unlock}
                    iconSize={14}
                    onClick={() => setUnlockTarget(u)}
                    title="Mở khóa tài khoản"
                    className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-emerald-600! shadow-none! ring-0! hover:bg-emerald-50! hover:text-emerald-700!"
                  />
                ) : (
                  <Button
                    variant="secondary"
                    icon={Lock}
                    iconSize={14}
                    onClick={() => setLockTarget(u)}
                    title="Khóa tài khoản"
                    className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-rose-500! shadow-none! ring-0! hover:bg-rose-50! hover:text-rose-600!"
                  />
                )}
              </div>
            );
          },
        }),
      ]),
    [currentUser?.id],
  );

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. HEADER KHU VỰC QUẢN TRỊ NGƯỜI DÙNG
         ========================================================================= */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-main sm:text-2xl">
            Quản trị người dùng
          </h1>
          <p className="text-xs text-text-muted sm:text-sm">
            Kiểm soát tài khoản, phân quyền vai trò và bảo vệ tính an toàn của
            toàn hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={RotateCw}
            iconSize={14}
            isLoading={isRefetching}
            onClick={() => refetch()}
            className="h-9! px-3! text-xs! font-medium!"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* =========================================================================
          2. BỘ LỌC VAI TRÒ (TABS) & TÌM KIẾM + TRẠNG THÁI (ANIMATE-UI SELECT)
         ========================================================================= */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Tabs vai trò */}
          <div className="flex flex-wrap items-center gap-1 border-b border-border/60 pb-2 lg:border-b-0 lg:pb-0">
            {ROLE_TABS.map((tab) => {
              const isActive = activeRoleTab === tab.key;
              const count =
                tab.key === "ALL"
                  ? (overview?.users.total ?? totalItems)
                  : undefined;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleRoleTabChange(tab.key)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                    isActive
                      ? "bg-secondary-light text-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <span>{tab.label}</span>
                  {typeof count === "number" && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {count < 10 && count > 0 ? `0${count}` : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cụm công cụ tìm kiếm và lọc trạng thái */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            {/* Lọc trạng thái bằng Animate-UI Select */}
            <div className="w-full sm:w-44">
              <Select.Root
                items={STATUS_OPTIONS}
                value={activeStatus}
                onValueChange={(val) => {
                  if (val) handleStatusChange(val);
                }}
              >
                <Select.Trigger
                  aria-label="Lọc theo trạng thái"
                  className="group flex h-9 w-full cursor-pointer items-center justify-between gap-1.5 rounded-xl border border-border bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-100/60 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20 focus:outline-none"
                >
                  <Select.Value />
                  <Select.Icon className="text-text-muted transition-transform duration-200 group-data-popup-open:rotate-180">
                    <ChevronDown className="size-3.5" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Positioner
                    alignItemWithTrigger={false}
                    sideOffset={6}
                  >
                    <Select.Popup className="z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-md">
                      <Select.List>
                        {STATUS_OPTIONS.map((opt) => (
                          <Select.Item
                            key={opt.value}
                            value={opt.value}
                            className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-text-main transition-colors hover:bg-bg data-highlighted:bg-bg data-[state=checked]:font-semibold data-[state=checked]:text-primary"
                          >
                            <Select.ItemText>{opt.label}</Select.ItemText>
                            <Select.ItemIndicator
                              animation="pop"
                              className="ml-2 text-xs text-primary"
                            >
                              ✓
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Ô tìm kiếm từ khóa */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full sm:w-64"
            >
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tên, email, SĐT..."
                className="h-9 w-full rounded-xl border border-border bg-slate-50/50 py-1.5 pr-8 pl-9 text-xs text-slate-800 transition-colors outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. BẢNG DỮ LIỆU TÀI KHOẢN NGƯỜI DÙNG (DATATABLE VỚI SORTING & PHÂN TRANG)
         ========================================================================= */}
      <div>
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <TableSkeleton />
          </div>
        ) : users.length === 0 ? (
          /* Empty State bằng hình ảnh đồ họa theo yêu cầu */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-12 text-center">
            <img
              src={EmptyStreet}
              alt="Không tìm thấy người dùng"
              className="h-44 w-auto object-contain select-none"
            />
            <h3 className="mt-4 text-base font-bold text-text-main">
              Không tìm thấy người dùng nào
            </h3>
            <p className="mt-1 max-w-sm text-xs text-text-muted">
              {search || activeRoleTab !== "ALL" || activeStatus !== "ALL"
                ? "Không có tài khoản nào phù hợp với bộ lọc hiện tại. Hãy thử tìm kiếm với từ khóa khác hoặc xóa bớt tiêu chí lọc."
                : "Hệ thống hiện chưa ghi nhận tài khoản người dùng nào."}
            </p>
            {(search || activeRoleTab !== "ALL" || activeStatus !== "ALL") && (
              <Button
                variant="secondary"
                onClick={handleClearAllFilters}
                className="mt-4 h-8! px-3! text-xs!"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <DataTable
              columns={columns}
              data={users}
              initialSorting={[{ id: "createdAt", desc: true }]}
              emptyMessage="Không có người dùng nào phù hợp với bộ lọc."
            />

            {/* Thanh phân trang Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-5 py-3.5 sm:flex-row">
                <span className="text-xs text-text-muted">
                  Hiển thị <strong>{(page - 1) * pageSize + 1}</strong> –{" "}
                  <strong>{Math.min(page * pageSize, totalItems)}</strong> trong
                  tổng số <strong>{totalItems}</strong> người dùng
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    icon={ChevronLeft}
                    iconSize={14}
                    disabled={page <= 1}
                    onClick={() =>
                      updateParams({ page: (page - 1).toString() })
                    }
                    className="h-8! w-8! p-0!"
                    title="Trang trước"
                  />
                  <span className="px-2 text-xs font-semibold text-slate-700">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    icon={ChevronRight}
                    iconSize={14}
                    disabled={page >= totalPages}
                    onClick={() =>
                      updateParams({ page: (page + 1).toString() })
                    }
                    className="h-8! w-8! p-0!"
                    title="Trang sau"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          4. DIALOG XÁC NHẬN KHÓA TÀI KHOẢN (KÈM CẢNH BÁO BẢO MẬT)
         ========================================================================= */}
      <Dialog
        open={Boolean(lockTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setLockTarget(null);
            setLockReason("");
          }
        }}
      >
        <DialogContent className="max-w-md overflow-hidden rounded-2xl border border-border bg-surface p-0 shadow-xl">
          <div className="p-6">
            <div className="flex items-start gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-200">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-base font-bold text-slate-900">
                  Xác nhận khóa tài khoản
                </DialogTitle>
                <DialogDescription className="text-xs leading-relaxed text-slate-600">
                  Bạn có chắc chắn muốn khóa tài khoản này?
                </DialogDescription>
              </div>
            </div>

            {/* Thông tin đối tượng bị khóa */}
            {lockTarget && (
              <div className="mt-4 rounded-xl border border-border/80 bg-slate-50/70 p-3.5">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={lockTarget.fullName}
                    src={lockTarget.avatarUrl || ""}
                    className="h-10 w-10 shrink-0 ring-1 ring-border"
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-semibold text-slate-900">
                      {lockTarget.fullName}
                    </span>
                    <span className="truncate text-[11px] text-slate-500">
                      {lockTarget.email}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {lockTarget.roles.map((r) => (
                        <span
                          key={r}
                          className="py-0.2 rounded bg-slate-200/80 px-1.5 text-[9px] font-semibold text-slate-700"
                        >
                          {ROLE_BADGE_CONFIG[r]?.label ?? r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cảnh báo an ninh */}
            <div className="mt-4 rounded-xl border border-rose-200/80 bg-rose-50/60 p-3 text-xs text-rose-800">
              <p className="flex items-center gap-1.5 font-semibold">
                Lưu ý quan trọng:
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-rose-700">
                Khi khóa tài khoản này, toàn bộ phiên đăng nhập sẽ bị thu hồi
                ngay lập tức và người dùng sẽ bị đăng xuất khỏi toàn bộ thiết
                bị.
              </p>
            </div>

            {/* Nhập lý do khóa (tùy chọn) */}
            <div className="mt-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Lý do khóa tài khoản (tùy chọn)
              </label>
              <textarea
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Ví dụ: Vi phạm chính sách tuyển dụng, nghi vấn mạo danh doanh nghiệp..."
                rows={2}
                maxLength={300}
                className="w-full resize-none rounded-xl border border-border bg-slate-50/50 p-2.5 text-xs text-slate-800 transition-colors outline-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border/60 bg-slate-50/50 px-6 py-3 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setLockTarget(null);
                setLockReason("");
              }}
              disabled={updateUserStatusMutation.isPending}
              className="h-9! px-4! text-xs!"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmLock}
              isLoading={updateUserStatusMutation.isPending}
              className="h-9! bg-rose-600! px-4! text-xs! font-semibold! text-white! hover:bg-rose-700!"
            >
              Khóa tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          5. DIALOG XÁC NHẬN MỞ KHÓA TÀI KHOẢN
         ========================================================================= */}
      <Dialog
        open={Boolean(unlockTarget)}
        onOpenChange={(open) => {
          if (!open) setUnlockTarget(null);
        }}
      >
        <DialogContent className="max-w-md overflow-hidden rounded-2xl border border-border bg-surface p-0 shadow-xl">
          <div className="p-6">
            <div className="flex items-start gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                <ShieldCheck className="size-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-base font-bold text-slate-900">
                  Mở khóa tài khoản
                </DialogTitle>
                <DialogDescription className="text-xs leading-relaxed text-slate-600">
                  Bạn có chắc chắn muốn mở lại quyền truy cập cho người dùng
                  này?
                </DialogDescription>
              </div>
            </div>

            {/* Thông tin đối tượng mở khóa */}
            {unlockTarget && (
              <div className="mt-4 rounded-xl border border-border/80 bg-slate-50/70 p-3.5">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={unlockTarget.fullName}
                    src={unlockTarget.avatarUrl || ""}
                    className="h-10 w-10 shrink-0 ring-1 ring-border"
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-semibold text-slate-900">
                      {unlockTarget.fullName}
                    </span>
                    <span className="truncate text-[11px] text-slate-500">
                      {unlockTarget.email}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {unlockTarget.roles.map((r) => (
                        <span
                          key={r}
                          className="py-0.2 rounded bg-slate-200/80 px-1.5 text-[9px] font-semibold text-slate-700"
                        >
                          {ROLE_BADGE_CONFIG[r]?.label ?? r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-4 text-xs leading-relaxed text-slate-600">
              Sau khi mở khóa, người dùng sẽ có thể đăng nhập bình thường vào hệ
              thống SmartHire bằng mật khẩu hoặc các phương thức xác thực đã
              đăng ký.
            </p>
          </div>

          <DialogFooter className="gap-2 border-t border-border/60 bg-slate-50/50 px-6 py-3 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setUnlockTarget(null)}
              disabled={updateUserStatusMutation.isPending}
              className="h-9! px-4! text-xs!"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmUnlock}
              isLoading={updateUserStatusMutation.isPending}
              className="h-9! bg-emerald-600! px-4! text-xs! font-semibold! text-white! hover:bg-emerald-700!"
            >
              Mở khóa tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
