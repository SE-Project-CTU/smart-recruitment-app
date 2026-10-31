import { useState, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import {
  UserPlus,
  ShieldCheck,
  Search,
  X,
  ArrowRightLeft,
  Calendar,
  AlertCircle,
  ChevronDown,
  UserMinus,
  LogOut,
} from "lucide-react";
import dayjs from "dayjs";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import {
  Button,
  DataTable,
  type DataTableFeatures,
  TableSkeleton,
  UserAvatar,
} from "@/components/common";
import { getApiErrorMessage } from "@/api/errorHandler";
import {
  useCompanyMembers,
  useTransferOwnership,
  useRemoveCompanyMember,
  useLeaveCompany,
} from "@/hooks/queries/useCompany";
import { PATHS } from "@/constants/paths";
import { InviteMemberModal } from "./InviteMemberModal";
import type { CompanyOutletContext } from "./CompanyDetailLayout";
import type { CompanyMember } from "@/types/company";

const ROLE_OPTIONS = [
  { value: "ALL", label: "Tất cả vai trò" },
  { value: "Owner", label: "Chủ sở hữu" },
  { value: "Member", label: "Thành viên" },
];

const columnHelper = createColumnHelper<DataTableFeatures, CompanyMember>();

export function CompanyMembersTab() {
  const navigate = useNavigate();
  const { company, isOwner, refreshCompany } =
    useOutletContext<CompanyOutletContext>();

  const {
    data: membersData,
    isLoading,
    refetch: refetchMembers,
  } = useCompanyMembers(company.id);
  const members = useMemo(() => membersData?.items ?? [], [membersData?.items]);

  const { mutateAsync: transferOwnership, isPending: isTransferring } =
    useTransferOwnership();
  const { mutateAsync: removeMember, isPending: isRemoving } =
    useRemoveCompanyMember();
  const { mutateAsync: leaveCompany, isPending: isLeaving } = useLeaveCompany();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Transfer ownership modal state
  const [transferTarget, setTransferTarget] = useState<CompanyMember | null>(
    null,
  );
  const [transferMessage, setTransferMessage] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Remove member modal state
  const [removeTarget, setRemoveTarget] = useState<CompanyMember | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  // Leave company modal state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  const handleTransferOwnership = async () => {
    if (!transferTarget) return;
    try {
      setTransferError(null);
      await transferOwnership({
        companyId: company.id,
        newOwnerId: transferTarget.user.id,
      });
      setTransferMessage(
        `Đã chuyển quyền Chủ sở hữu cho ${transferTarget.user.fullName}!`,
      );
      setTimeout(async () => {
        setTransferTarget(null);
        setTransferMessage(null);
        await refreshCompany();
      }, 1500);
    } catch (err: unknown) {
      setTransferError(
        getApiErrorMessage(err, "Chuyển quyền thất bại. Vui lòng thử lại!"),
      );
    }
  };

  const handleRemoveMember = async () => {
    if (!removeTarget) return;
    try {
      setRemoveError(null);
      await removeMember({
        companyId: company.id,
        memberId: removeTarget.id,
      });
      setRemoveTarget(null);
      await refetchMembers();
    } catch (err: unknown) {
      setRemoveError(
        getApiErrorMessage(err, "Không thể xóa thành viên. Vui lòng thử lại!"),
      );
    }
  };

  const handleLeaveCompany = async () => {
    try {
      setLeaveError(null);
      await leaveCompany(company.id);
      setIsLeaveModalOpen(false);
      navigate(PATHS.RECRUITER.COMPANY_MANAGEMENT);
    } catch (err: unknown) {
      setLeaveError(
        getApiErrorMessage(err, "Không thể rời công ty. Vui lòng thử lại!"),
      );
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (roleFilter !== "ALL" && m.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          m.user.fullName.toLowerCase().includes(q) ||
          m.user.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [members, roleFilter, searchQuery]);

  const columns = useMemo(() => {
    return columnHelper.columns([
      columnHelper.accessor((row) => row.user.fullName, {
        id: "user",
        header: "Thành viên",
        cell: ({ row }) => {
          const user = row.original.user;
          return (
            <div className="flex items-center gap-3">
              <UserAvatar
                src={user.avatarUrl || ""}
                name={user.fullName}
                className="size-9 rounded-full border border-border object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-main">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-text-muted">{user.email}</p>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor("role", {
        header: "Vai trò",
        cell: (info) => {
          const role = info.getValue();
          return role === "Owner" ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
              <ShieldCheck className="size-3.5" />
              Chủ sở hữu
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              Thành viên
            </span>
          );
        },
      }),

      columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: (info) => {
          const status = info.getValue();
          return status === "Active" ? (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Hoạt động
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              Tạm ngừng
            </span>
          );
        },
      }),

      columnHelper.accessor("joinedAt", {
        header: "Ngày tham gia",
        cell: (info) => {
          const val = info.getValue();
          return (
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Calendar className="size-3.5 shrink-0" />
              <span>{val ? dayjs(val).format("DD/MM/YYYY") : "—"}</span>
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "actions",
        header: "Thao tác",
        cell: (info) => {
          const member = info.row.original;
          // Chỉ Owner hiện tại mới có quyền chuyển giao quyền hoặc loại bỏ member khác
          if (isOwner && member.role !== "Owner") {
            return (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-slate-200! px-2.5! py-1! text-xs! font-medium! text-slate-700! ring-slate-200! hover:border-purple-300! hover:text-purple-700! hover:ring-purple-300!"
                  icon={ArrowRightLeft}
                  onClick={() => setTransferTarget(member)}
                >
                  Ủy quyền Owner
                </Button>
                <Button
                  variant="outline"
                  className="border-rose-200! px-2.5! py-1! text-xs! font-medium! text-rose-600! ring-rose-200! hover:border-rose-300! hover:bg-rose-50!"
                  icon={UserMinus}
                  onClick={() => {
                    setRemoveError(null);
                    setRemoveTarget(member);
                  }}
                >
                  Xóa
                </Button>
              </div>
            );
          }
          return <span className="text-xs text-text-muted">—</span>;
        },
      }),
    ]);
  }, [isOwner]);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-text-main sm:text-lg">
            Đội ngũ tuyển dụng ({members.length})
          </h2>
          <p className="text-xs text-text-muted">
            Tất cả thành viên trực thuộc doanh nghiệp tham gia quản trị và xử lý
            ứng tuyển
          </p>
        </div>

        {/* Nút hành động: Owner thì có nút Mời thành viên; Thành viên thường có nút Rời công ty */}
        <div className="flex items-center gap-2">
          {isOwner ? (
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Mời thành viên mới
            </Button>
          ) : (
            <Button
              variant="outline"
              className="border-rose-200! text-rose-600! hover:border-rose-300! hover:bg-rose-50!"
              icon={LogOut}
              onClick={() => {
                setLeaveError(null);
                setIsLeaveModalOpen(true);
              }}
            >
              Rời công ty
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên thành viên hoặc email..."
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

        <div className="flex items-center gap-2">
          <Select.Root
            items={ROLE_OPTIONS}
            value={roleFilter}
            onValueChange={(val) => {
              if (val) setRoleFilter(val);
            }}
          >
            <Select.Trigger
              aria-label="Lọc theo vai trò"
              className="group flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2 text-xs font-medium text-text-main focus:border-primary focus:outline-none"
            >
              <Select.Value />
              <Select.Icon className="text-text-muted transition-transform duration-200 group-data-popup-open:rotate-180">
                <ChevronDown className="size-3.5" />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
                <Select.Popup className="z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-md">
                  <Select.List>
                    {ROLE_OPTIONS.map((opt) => (
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
      </div>

      {/* DataTable */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={filteredMembers}
          emptyMessage="Không tìm thấy thành viên nào phù hợp."
        />
      )}

      {/* Modal Mời Thành Viên */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        companyId={company.id}
        companyName={company.name}
        onSuccess={refetchMembers}
      />

      {/* Modal Xác nhận Chuyển quyền Chủ sở hữu */}
      {transferTarget && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6">
            <div className="mb-3 flex items-center gap-3 text-amber-600">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50">
                <AlertCircle className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-main">
                  Xác nhận ủy quyền Chủ sở hữu
                </h3>
                <p className="text-xs text-text-muted">
                  Hành động này sẽ thay đổi vai trò quản trị của bạn
                </p>
              </div>
            </div>

            {transferError && (
              <div className="my-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            {transferMessage ? (
              <div className="my-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                {transferMessage}
              </div>
            ) : (
              <p className="my-4 text-xs leading-relaxed text-text-main">
                Bạn có chắc chắn muốn chuyển giao toàn bộ quyền{" "}
                <strong>Chủ sở hữu (Owner)</strong> của công ty{" "}
                <strong>{company.name}</strong> cho thành viên{" "}
                <strong>{transferTarget.user.fullName}</strong> (
                {transferTarget.user.email})? Sau khi chuyển giao, tài khoản của
                bạn sẽ trở thành <strong>Thành viên (HR)</strong> thông thường.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button
                variant="secondary"
                disabled={isTransferring}
                onClick={() => setTransferTarget(null)}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                isLoading={isTransferring}
                onClick={handleTransferOwnership}
              >
                Đồng ý chuyển quyền
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa thành viên khỏi công ty */}
      {removeTarget && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6">
            <div className="mb-3 flex items-center gap-3 text-rose-600">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50">
                <AlertCircle className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-main">
                  Xác nhận xóa thành viên
                </h3>
                <p className="text-xs text-text-muted">
                  Thành viên sẽ bị thu hồi quyền truy cập vào doanh nghiệp
                </p>
              </div>
            </div>

            {removeError && (
              <div className="my-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{removeError}</span>
              </div>
            )}

            <p className="my-4 text-xs leading-relaxed text-text-main">
              Bạn có chắc chắn muốn xóa thành viên{" "}
              <strong>{removeTarget.user.fullName}</strong> (
              {removeTarget.user.email}) khỏi công ty{" "}
              <strong>{company.name}</strong>? Sau khi xóa, người này sẽ không
              còn quyền xem và quản lý tin tuyển dụng hoặc ứng viên của doanh
              nghiệp.
            </p>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button
                variant="secondary"
                disabled={isRemoving}
                onClick={() => setRemoveTarget(null)}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                className="bg-rose-600! hover:bg-rose-700!"
                isLoading={isRemoving}
                onClick={handleRemoveMember}
              >
                Xóa thành viên
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Rời khỏi công ty */}
      {isLeaveModalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6">
            <div className="mb-3 flex items-center gap-3 text-rose-600">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50">
                <AlertCircle className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-main">
                  Xác nhận rời khỏi doanh nghiệp
                </h3>
                <p className="text-xs text-text-muted">
                  Hành động này sẽ hủy tư cách thành viên của bạn
                </p>
              </div>
            </div>

            {leaveError && (
              <div className="my-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{leaveError}</span>
              </div>
            )}

            <p className="my-4 text-xs leading-relaxed text-text-main">
              Bạn có chắc chắn muốn rời khỏi công ty{" "}
              <strong>{company.name}</strong>? Bạn sẽ không còn quyền quản lý
              tin tuyển dụng cũng như hồ sơ ứng tuyển của doanh nghiệp này nữa.
            </p>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button
                variant="secondary"
                disabled={isLeaving}
                onClick={() => setIsLeaveModalOpen(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                className="bg-rose-600! hover:bg-rose-700!"
                isLoading={isLeaving}
                onClick={handleLeaveCompany}
              >
                Rời công ty
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
