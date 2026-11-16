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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
            <span className="inline-flex items-center rounded-md border border-border bg-bg px-2.5 py-1 text-xs font-medium text-text-muted">
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
            <span className="inline-flex items-center rounded-full border border-status-success/30 bg-status-success/10 px-2.5 py-0.5 text-xs font-semibold text-status-success">
              Hoạt động
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-border bg-bg px-2.5 py-0.5 text-xs font-medium text-text-muted">
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
                  className="border-border! px-2.5! py-1! text-xs! font-medium! text-text-main! ring-border! hover:border-primary/40! hover:text-primary!"
                  icon={ArrowRightLeft}
                  onClick={() => setTransferTarget(member)}
                >
                  Ủy quyền Owner
                </Button>
                <Button
                  variant="outline"
                  className="border-status-error/30! px-2.5! py-1! text-xs! font-medium! text-status-error! ring-status-error/20! hover:border-status-error/50! hover:bg-status-error/10!"
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
              className="border-status-error/30! text-status-error! hover:border-status-error/50! hover:bg-status-error/10!"
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
      <AlertDialog
        open={Boolean(transferTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setTransferTarget(null);
            setTransferError(null);
            setTransferMessage(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận ủy quyền chủ sở hữu</AlertDialogTitle>
            <AlertDialogDescription>
              {transferMessage
                ? transferMessage
                : `Bạn có chắc chắn muốn chuyển giao toàn bộ quyền chủ sở hữu của công ty ${company.name} cho thành viên ${transferTarget?.user.fullName} (${transferTarget?.user.email})? Sau khi chuyển giao, tài khoản của bạn sẽ trở thành thành viên thông thường.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {transferError && (
            <div className="rounded-xl border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error font-medium">
              {transferError}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isTransferring}
              onClick={() => {
                setTransferTarget(null);
                setTransferError(null);
                setTransferMessage(null);
              }}
            >
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              variant="default"
              disabled={isTransferring}
              onClick={handleTransferOwnership}
            >
              {isTransferring ? "Đang chuyển quyền..." : "Đồng ý chuyển quyền"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Xác nhận Xóa thành viên khỏi công ty */}
      <AlertDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRemoveTarget(null);
            setRemoveError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thành viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thành viên {removeTarget?.user.fullName}{" "}
              ({removeTarget?.user.email}) khỏi công ty {company.name}? Người
              này sẽ không còn quyền xem và quản lý tin tuyển dụng hoặc ứng viên
              của doanh nghiệp.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {removeError && (
            <div className="rounded-xl border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error font-medium">
              {removeError}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isRemoving}
              onClick={() => {
                setRemoveTarget(null);
                setRemoveError(null);
              }}
            >
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isRemoving}
              onClick={handleRemoveMember}
            >
              {isRemoving ? "Đang xóa..." : "Xóa thành viên"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Xác nhận Rời khỏi công ty */}
      <AlertDialog
        open={isLeaveModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsLeaveModalOpen(false);
            setLeaveError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận rời khỏi doanh nghiệp</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn rời khỏi công ty {company.name}? Bạn sẽ
              không còn quyền quản lý tin tuyển dụng cũng như hồ sơ ứng tuyển
              của doanh nghiệp này nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {leaveError && (
            <div className="rounded-xl border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error font-medium">
              {leaveError}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isLeaving}
              onClick={() => {
                setIsLeaveModalOpen(false);
                setLeaveError(null);
              }}
            >
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isLeaving}
              onClick={handleLeaveCompany}
            >
              {isLeaving ? "Đang rời..." : "Rời công ty"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
