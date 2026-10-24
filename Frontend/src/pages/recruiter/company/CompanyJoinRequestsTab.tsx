import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Check,
  X,
  Search,
  RotateCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import dayjs from "dayjs";
import Button from "@/components/Button";
import { DataTable, type DataTableFeatures } from "@/components/DataTable";
import { UserAvatar } from "@/components/UserAvatar";
import { toast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/api/errorHandler";
import {
  useCompanyJoinRequests,
  useReviewJoinRequest,
} from "@/hooks/queries/useCompany";
import type { CompanyOutletContext } from "./CompanyDetailLayout";
import type {
  CompanyJoinRequestItem,
  CompanyJoinRequestStatus,
} from "@/types/company";

type TabStatus = "ALL" | CompanyJoinRequestStatus;

interface TabConfig {
  key: TabStatus;
  label: string;
}

const TABS: TabConfig[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "Pending", label: "Chờ duyệt" },
  { key: "Approved", label: "Đã duyệt" },
  { key: "Rejected", label: "Đã từ chối" },
];

const STATUS_BADGE_CONFIG: Record<
  CompanyJoinRequestStatus,
  { label: string; badgeClass: string; icon: typeof Clock }
> = {
  Pending: {
    label: "Chờ duyệt",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  Approved: {
    label: "Đã duyệt",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  Rejected: {
    label: "Đã từ chối",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
};

const columnHelper = createColumnHelper<
  DataTableFeatures,
  CompanyJoinRequestItem
>();

export function CompanyJoinRequestsTab() {
  const { company, isOwner } = useOutletContext<CompanyOutletContext>();

  const [activeTab, setActiveTab] = useState<TabStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Lấy danh sách yêu cầu gia nhập theo công ty (Chỉ Owner - API 10)
  const {
    data: joinRequestsData,
    isLoading,
    isFetching,
    refetch,
  } = useCompanyJoinRequests(company.id);

  const joinRequests = joinRequestsData?.items ?? [];

  const { mutateAsync: reviewJoinRequest, isPending: isReviewing } =
    useReviewJoinRequest();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<CompanyJoinRequestItem | null>(null);

  // Thống kê số lượng cho các tab
  const counts = useMemo(() => {
    return {
      ALL: joinRequests.length,
      Pending: joinRequests.filter((r) => r.status === "Pending").length,
      Approved: joinRequests.filter((r) => r.status === "Approved").length,
      Rejected: joinRequests.filter((r) => r.status === "Rejected").length,
    };
  }, [joinRequests]);

  // Lọc dữ liệu theo tab và từ khóa tìm kiếm (theo tên hoặc email người gửi)
  const filteredData = useMemo(() => {
    let result = joinRequests;
    if (activeTab !== "ALL") {
      result = result.filter((r) => r.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.user?.fullName.toLowerCase().includes(q) ||
          r.user?.email.toLowerCase().includes(q),
      );
    }
    return result;
  }, [joinRequests, activeTab, searchQuery]);

  // Phân trang
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Xử lý phê duyệt yêu cầu gia nhập
  const handleApprove = async (request: CompanyJoinRequestItem) => {
    try {
      setProcessingId(request.id);
      await reviewJoinRequest({
        companyId: company.id,
        requestId: request.id,
        payload: { status: "APPROVED" },
      });
      toast.add({
        type: "success",
        description: `Đã phê duyệt yêu cầu của ${request.user?.fullName || "nhà tuyển dụng"}! Thành viên đã được thêm vào công ty.`,
      });
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể phê duyệt yêu cầu. Vui lòng thử lại sau.",
      );
      toast.add({ type: "error", description: msg });
    } finally {
      setProcessingId(null);
    }
  };

  // Xác nhận từ chối yêu cầu gia nhập
  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    try {
      setProcessingId(rejectTarget.id);
      await reviewJoinRequest({
        companyId: company.id,
        requestId: rejectTarget.id,
        payload: { status: "REJECTED" },
      });
      toast.add({
        type: "info",
        description: `Đã từ chối yêu cầu gia nhập từ ${rejectTarget.user?.fullName || "nhà tuyển dụng"}.`,
      });
      setRejectTarget(null);
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể từ chối yêu cầu. Vui lòng thử lại sau.",
      );
      toast.add({ type: "error", description: msg });
    } finally {
      setProcessingId(null);
    }
  };

  // Cấu hình cột hiển thị cho bảng DataTable
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

        columnHelper.accessor((row) => row.user?.fullName ?? "", {
          id: "userInfo",
          header: "Người gửi yêu cầu",
          cell: ({ row }) => {
            const req = row.original;
            const userName = req.user?.fullName || "Nhà tuyển dụng";
            const userEmail = req.user?.email || "Chưa có email";

            return (
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={req.user?.avatarUrl ?? ""}
                  name={userName}
                  className="size-10 shrink-0"
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-slate-800">
                    {userName}
                  </span>
                  <span className="truncate text-xs text-slate-400">
                    {userEmail}
                  </span>
                </div>
              </div>
            );
          },
        }),

        columnHelper.accessor("createdAt", {
          header: "Thời gian gửi",
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
            const req = row.original;
            const isRowProcessing = processingId === req.id && isReviewing;

            if (req.status === "Pending") {
              return (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="primary"
                    icon={Check}
                    iconSize={14}
                    isLoading={isRowProcessing}
                    disabled={Boolean(processingId)}
                    onClick={() => handleApprove(req)}
                    className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-emerald-600! shadow-none! ring-0! hover:bg-emerald-50! hover:text-emerald-700! disabled:text-text-muted! disabled:opacity-40! disabled:hover:bg-transparent!"
                  ></Button>
                  <Button
                    variant="secondary"
                    icon={X}
                    iconSize={14}
                    disabled={Boolean(processingId)}
                    onClick={() => setRejectTarget(req)}
                    className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-rose-500! shadow-none! ring-0! hover:bg-rose-50! hover:text-rose-600! disabled:text-text-muted! disabled:opacity-40! disabled:hover:bg-transparent!"
                  ></Button>
                </div>
              );
            }

            if (req.status === "Approved") {
              return (
                <div className="flex items-center justify-end">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="size-3.5" />
                    Đã là thành viên
                  </span>
                </div>
              );
            }

            return (
              <div className="flex items-center justify-end">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                  <XCircle className="size-3.5" />
                  Đã từ chối
                </span>
              </div>
            );
          },
        }),
      ]),
    [currentPage, pageSize, processingId, isReviewing],
  );

  // Kiểm tra quyền: Chỉ Company Owner mới được xem và xét duyệt
  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-surface py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert className="size-7" />
        </div>
        <h3 className="text-base font-bold text-text-main">
          Quyền truy cập bị hạn chế
        </h3>
        <p className="mt-1.5 max-w-md text-xs text-text-muted">
          Chỉ <strong>Chủ sở hữu (Owner)</strong> của công ty{" "}
          <strong>{company.name}</strong> mới có quyền truy cập và xét duyệt các
          yêu cầu gia nhập này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề & thông tin khu vực xét duyệt */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            Yêu cầu gia nhập doanh nghiệp ({counts.Pending} chờ duyệt)
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Xem và xét duyệt các yêu cầu tham gia đội ngũ tuyển dụng từ các nhà
            tuyển dụng khác
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

      {/* Bộ lọc trạng thái & tìm kiếm */}
      <div className="rounded-2xl bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Tabs trạng thái */}
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
                      ? "bg-secondary-light text-primary"
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

          {/* Tìm kiếm */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên hoặc email..."
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

        {/* Bảng dữ liệu yêu cầu gia nhập */}
        <div className="mt-4">
          <DataTable
            columns={columns}
            data={paginatedData}
            emptyMessage={
              isLoading
                ? "Đang tải danh sách yêu cầu..."
                : searchQuery
                  ? "Không tìm thấy yêu cầu nào khớp với từ khóa tìm kiếm."
                  : "Chưa có yêu cầu gia nhập nào trong mục này."
            }
          />
        </div>

        {/* Phân trang */}
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
              yêu cầu
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

      {/* Modal xác nhận từ chối yêu cầu gia nhập */}
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
                    Từ chối yêu cầu gia nhập
                  </h3>
                  <p className="text-xs text-slate-500">
                    Xác nhận từ chối người ứng tuyển
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                disabled={isReviewing}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
              Bạn có chắc chắn muốn từ chối yêu cầu gia nhập của nhà tuyển dụng{" "}
              <span className="font-semibold text-slate-900">
                {rejectTarget.user?.fullName} ({rejectTarget.user?.email})
              </span>
              ? Người dùng này sẽ không thể tham gia vào đội ngũ tuyển dụng của
              công ty trừ khi gửi lại yêu cầu khác.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                disabled={isReviewing}
                onClick={() => setRejectTarget(null)}
                className="h-9! px-4! text-xs! font-medium!"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                isLoading={isReviewing}
                onClick={handleConfirmReject}
                className="h-9! bg-rose-600! px-4! text-xs! font-medium! text-white! hover:bg-rose-700!"
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyJoinRequestsTab;
