import { useState, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Building2,
  Check,
  X,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import dayjs from "dayjs";
import Button from "@/components/Button";
import { DataTable, type DataTableFeatures } from "@/components/DataTable";
import { toast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/api/errorHandler";
import {
  useMyCompanyInvitationsAll,
  useAcceptInvitation,
  useRejectInvitation,
} from "@/hooks/queries/useCompany";
import { useCompanyStore } from "@/stores/companyStore";
import { CompanyDetailDrawer } from "@/components/company/CompanyDetailDrawer";
import type {
  CompanyInvitationItem,
  CompanyInvitationStatus,
} from "@/types/company";

type TabStatus = "ALL" | CompanyInvitationStatus;

interface TabConfig {
  key: TabStatus;
  label: string;
}

const TABS: TabConfig[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "Pending", label: "Chờ phản hồi" },
  { key: "Accepted", label: "Đã chấp nhận" },
  { key: "Rejected", label: "Đã từ chối" },
  { key: "Expired", label: "Hết hạn" },
];

const STATUS_BADGE_CONFIG: Record<
  CompanyInvitationStatus,
  { label: string; badgeClass: string; icon: typeof Clock }
> = {
  Pending: {
    label: "Chờ phản hồi",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  Accepted: {
    label: "Đã chấp nhận",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  Rejected: {
    label: "Đã từ chối",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
  Expired: {
    label: "Hết hạn",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    icon: AlertCircle,
  },
};

const columnHelper = createColumnHelper<
  DataTableFeatures,
  CompanyInvitationItem
>();

export function CompanyInvitation() {
  const [activeTab, setActiveTab] = useState<TabStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Lấy dữ liệu toàn bộ trạng thái để tính đúng số lượng cho từng tab
  const { items, byStatus, counts, isLoading, isFetching, refetch } =
    useMyCompanyInvitationsAll();

  const { mutateAsync: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation();
  const { mutateAsync: rejectInvitation, isPending: isRejecting } =
    useRejectInvitation();

  const { openCompanyDrawer } = useCompanyStore();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<CompanyInvitationItem | null>(null);

  // Lọc dữ liệu theo tab đang chọn và từ khóa tìm kiếm tên doanh nghiệp
  const filteredData = useMemo(() => {
    const sourceList =
      activeTab === "ALL" ? items : (byStatus[activeTab] ?? []);
    if (!searchQuery.trim()) return sourceList;

    const query = searchQuery.trim().toLowerCase();
    return sourceList.filter((invitation) =>
      (invitation.company?.name ?? "").toLowerCase().includes(query),
    );
  }, [activeTab, items, byStatus, searchQuery]);

  // Phân trang danh sách đã lọc
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Xử lý chấp nhận lời mời
  const handleAccept = async (invitation: CompanyInvitationItem) => {
    try {
      setProcessingId(invitation.id);
      await acceptInvitation(invitation.id);
      toast.add({
        type: "success",
        description: `Bạn đã tham gia công ty ${invitation.company?.name || "doanh nghiệp"} thành công!`,
      });
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể chấp nhận lời mời. Vui lòng thử lại sau.",
      );
      toast.add({ type: "error", description: msg });
    } finally {
      setProcessingId(null);
    }
  };

  // Xác nhận từ chối lời mời
  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    try {
      setProcessingId(rejectTarget.id);
      await rejectInvitation(rejectTarget.id);
      toast.add({
        type: "info",
        description: `Đã từ chối lời mời gia nhập từ ${rejectTarget.company?.name || "doanh nghiệp"}.`,
      });
      setRejectTarget(null);
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể từ chối lời mời. Vui lòng thử lại sau.",
      );
      toast.add({ type: "error", description: msg });
    } finally {
      setProcessingId(null);
    }
  };

  // Khởi tạo cột hiển thị của bảng DataTable
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: "index",
          header: () => <div className="text-center font-semibold">#STT</div>,
          meta: { className: "w-16 text-center" },
          cell: ({ row }) => {
            const displayIndex = (currentPage - 1) * pageSize + row.index + 1;
            return (
              <span className="text-xs font-semibold text-slate-500">
                #{displayIndex < 10 ? `0${displayIndex}` : displayIndex}
              </span>
            );
          },
        }),

        columnHelper.accessor((row) => row.company?.name ?? "", {
          id: "companyInfo",
          header: "Doanh nghiệp",
          cell: ({ row }) => {
            const invitation = row.original;
            const companyName =
              invitation.company?.name || "Doanh nghiệp ẩn danh";
            const verificationStatus =
              invitation.company?.verificationStatus || "Pending";

            return (
              <div className="flex items-center gap-3">
                <div
                  onClick={() =>
                    openCompanyDrawer(invitation.companyId, invitation)
                  }
                  className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-slate-50 text-primary transition-colors hover:border-primary/50 hover:bg-primary/5"
                  title="Xem chi tiết doanh nghiệp"
                >
                  <Building2 className="size-5" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <button
                    type="button"
                    onClick={() =>
                      openCompanyDrawer(invitation.companyId, invitation)
                    }
                    className="cursor-pointer truncate text-left text-sm font-semibold text-slate-800 transition-colors hover:text-primary"
                    title="Mở hồ sơ doanh nghiệp"
                  >
                    {companyName}
                  </button>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {verificationStatus === "Verified" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <ShieldCheck className="size-3" />
                        Đã xác thực
                      </span>
                    ) : verificationStatus === "Pending" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                        <Clock className="size-3" />
                        Chờ xác thực
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600">
                        <AlertCircle className="size-3" />
                        Chưa duyệt
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          },
        }),

        columnHelper.accessor("createdAt", {
          header: "Ngày gửi",
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

        columnHelper.accessor("expiresAt", {
          header: "Hạn phản hồi",
          cell: ({ row }) => {
            const { expiresAt, status } = row.original;
            const isPast = dayjs().isAfter(dayjs(expiresAt));
            const isExpiredState = status === "Expired" || isPast;

            return (
              <div className="flex flex-col text-xs">
                <span
                  className={`font-semibold ${
                    isExpiredState && status === "Pending"
                      ? "text-rose-600"
                      : "text-slate-700"
                  }`}
                >
                  {dayjs(expiresAt).format("DD/MM/YYYY")}
                </span>
                <span className="text-[11px] text-slate-400">
                  {dayjs(expiresAt).format("HH:mm")}
                </span>
              </div>
            );
          },
        }),

        columnHelper.accessor("status", {
          header: "Trạng thái",
          cell: ({ row }) => {
            const status = row.original.status;
            const config = STATUS_BADGE_CONFIG[status];
            const StatusIcon = config.icon;

            return (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${config.badgeClass}`}
              >
                <StatusIcon className="size-3" />
                {config.label}
              </span>
            );
          },
        }),

        columnHelper.display({
          id: "actions",
          header: () => (
            <div className="text-right font-semibold">Thao tác</div>
          ),
          cell: ({ row }) => {
            const invitation = row.original;
            const isRowProcessing =
              processingId === invitation.id && (isAccepting || isRejecting);
            const isExpired =
              invitation.status === "Expired" ||
              dayjs().isAfter(dayjs(invitation.expiresAt));

            return (
              <div className="flex items-center justify-end gap-2">
                {/* Nút xem chi tiết doanh nghiệp qua API 2 */}
                <Button
                  variant="secondary"
                  icon={Eye}
                  iconSize={13}
                  onClick={() =>
                    openCompanyDrawer(invitation.companyId, invitation)
                  }
                  className="h-8! px-2.5! text-xs! font-medium!"
                  title="Xem chi tiết doanh nghiệp"
                >
                  Chi tiết
                </Button>

                {/* Chỉ cho phép xử lý khi trạng thái còn Pending và chưa quá hạn */}
                {invitation.status === "Pending" && !isExpired && (
                  <>
                    <Button
                      variant="primary"
                      icon={Check}
                      iconSize={14}
                      isLoading={isRowProcessing}
                      disabled={Boolean(processingId)}
                      onClick={() => handleAccept(invitation)}
                      className="h-8! px-3! text-xs! font-medium!"
                    >
                      Chấp nhận
                    </Button>
                    <Button
                      variant="secondary"
                      icon={X}
                      iconSize={14}
                      disabled={Boolean(processingId)}
                      onClick={() => setRejectTarget(invitation)}
                      className="aspect-square! h-8! p-1! text-xs! font-medium! text-rose-600! ring-status-error! hover:bg-rose-50!"
                      title="Từ chối lời mời"
                    ></Button>
                  </>
                )}

                {invitation.status === "Accepted" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="size-3.5" />
                    Đã là thành viên
                  </span>
                )}

                {invitation.status === "Rejected" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                    <XCircle className="size-3.5" />
                    Đã từ chối
                  </span>
                )}

                {(invitation.status === "Expired" ||
                  (isExpired && invitation.status === "Pending")) && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                    <Clock className="size-3.5" />
                    Hết hiệu lực
                  </span>
                )}
              </div>
            );
          },
        }),
      ]),
    [
      currentPage,
      pageSize,
      processingId,
      isAccepting,
      isRejecting,
      openCompanyDrawer,
    ],
  );

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Lời mời gia nhập doanh nghiệp
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm">
            Xem và phản hồi tất cả các lời mời tham gia đội ngũ tuyển dụng được
            gửi đến bạn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={RotateCw}
            iconSize={14}
            isLoading={isFetching}
            onClick={() => refetch()}
            className="h-9! px-3! text-xs! font-medium!"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Thanh tab trạng thái và công cụ tìm kiếm */}
      <div className="rounded-2xl bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Danh sách các tab trạng thái */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 pb-2 lg:border-b-0 lg:pb-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = counts[tab.key] ?? 0;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count < 10 && count > 0 ? `0${count}` : count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Ô tìm kiếm theo tên doanh nghiệp */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên công ty..."
              className="w-full rounded-xl border border-border bg-slate-50/50 py-2 pr-8 pl-9 text-xs text-slate-800 transition-colors outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bảng dữ liệu lời mời */}
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={paginatedData}
            emptyMessage={
              isLoading
                ? "Đang tải danh sách lời mời..."
                : searchQuery
                  ? "Không tìm thấy lời mời nào khớp với từ khóa tìm kiếm."
                  : "Chưa có lời mời nào trong mục này."
            }
          />
        </div>

        {/* Thanh phân trang */}
        {totalPages > 1 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
            <span className="text-xs text-slate-500">
              Hiển thị{" "}
              <span className="font-semibold text-slate-700">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(currentPage * pageSize, totalItems)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-slate-700">{totalItems}</span>{" "}
              lời mời
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                icon={ChevronLeft}
                iconSize={14}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8! px-2.5! text-xs! font-medium!"
              >
                Trước
              </Button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`size-8 rounded-lg text-xs font-semibold transition-colors ${
                        isCurrent
                          ? "bg-primary text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="secondary"
                icon={ChevronRight}
                iconPosition="right"
                iconSize={14}
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="h-8! px-2.5! text-xs! font-medium!"
              >
                Tiếp
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal xác nhận từ chối lời mời */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Từ chối lời mời gia nhập
                  </h3>
                  <p className="text-xs text-slate-500">
                    Xác nhận phản hồi lời mời
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                disabled={isRejecting}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
              Bạn có chắc chắn muốn từ chối lời mời tham gia doanh nghiệp{" "}
              <span className="font-semibold text-slate-900">
                {rejectTarget.company?.name || "này"}
              </span>
              ? Hành động này sẽ cập nhật trạng thái lời mời thành Đã từ chối và
              không thể hoàn tác.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                disabled={isRejecting}
                onClick={() => setRejectTarget(null)}
                className="h-9! px-4! text-xs! font-medium!"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                isLoading={isRejecting}
                onClick={handleConfirmReject}
                className="h-9! bg-rose-600! px-4! text-xs! font-medium! text-white! hover:bg-rose-700!"
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer xem chi tiết doanh nghiệp (dùng API 2 GET /companies/{id}) */}
      <CompanyDetailDrawer />
    </div>
  );
}

export default CompanyInvitation;
