import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  User,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Check,
  X,
  Copy,
  CheckCheck,
  ShieldAlert,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/common";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminCompanyDetail,
  useVerifyCompany,
} from "@/hooks/queries/useAdmin";
import { PATHS } from "@/constants/paths";
import type { AdminCompanyItem } from "@/types/admin";
import { cn } from "@/lib/utils";

interface CompanyInspectionSheetProps {
  company: AdminCompanyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CompanyInspectionSheet({
  company,
  isOpen,
  onClose,
  onSuccess,
}: CompanyInspectionSheetProps) {
  const companyId = company?.id;
  const [isMobile, setIsMobile] = useState(false);
  const [hasCopiedTax, setHasCopiedTax] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lấy chi tiết doanh nghiệp bao gồm MemberCount, JobPostingCount, Description
  const { data: detail, isLoading: isLoadingDetail } = useAdminCompanyDetail(
    isOpen ? companyId : undefined,
  );

  const verifyMutation = useVerifyCompany();

  // State cho dialog xác nhận Duyệt
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);

  // State cho dialog Từ chối kèm lý do
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const activeData = detail || company;

  if (!activeData) return null;

  const currentStatus = (
    activeData.verificationStatus || "Pending"
  ).toUpperCase();
  const isPending = currentStatus === "PENDING";
  const isVerified = currentStatus === "VERIFIED";
  const isRejected = currentStatus === "REJECTED";

  // Thao tác sao chép mã số thuế nhanh phục vụ tra cứu
  const handleCopyTaxCode = async () => {
    if (!activeData.taxCode) return;
    try {
      await navigator.clipboard.writeText(activeData.taxCode);
      setHasCopiedTax(true);
      setTimeout(() => setHasCopiedTax(false), 2000);
    } catch {
      // Bỏ qua lỗi clipboard
    }
  };

  // Thao tác duyệt
  const handleConfirmApprove = async () => {
    if (!companyId) return;
    try {
      await verifyMutation.mutateAsync({
        id: companyId,
        payload: { verificationStatus: "Verified" },
      });
      setIsApproveDialogOpen(false);
      onSuccess?.();
      onClose();
    } catch {
      // Error handled by mutation hook toast
    }
  };

  // Thao tác từ chối
  const handleConfirmReject = async () => {
    if (!companyId) return;
    if (!rejectionReason.trim()) {
      setReasonError("Vui lòng nhập lý do từ chối hồ sơ doanh nghiệp.");
      return;
    }

    try {
      await verifyMutation.mutateAsync({
        id: companyId,
        payload: {
          verificationStatus: "Rejected",
          reason: rejectionReason.trim(),
        },
      });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setReasonError("");
      onSuccess?.();
      onClose();
    } catch {
      // Error handled by mutation hook toast
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={
            isMobile
              ? "flex h-[90vh] max-h-[92vh] w-full flex-col gap-0 rounded-t-2xl border-t border-border bg-surface p-0 shadow-2xl backdrop-blur-none"
              : "flex w-full min-w-120 flex-col gap-0 overflow-hidden p-0 pt-10 backdrop-blur-none sm:max-w-lg"
          }
        >
          {isMobile && (
            <div className="flex w-full justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-slate-300" />
            </div>
          )}

          {/* HEADER: Flat Premium Architecture */}
          <SheetHeader className="shrink-0 border-b border-border/80 bg-surface p-5 pb-4 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-white p-2">
                  <CompanyLogo
                    name={activeData.name}
                    logoUrl={activeData.logoUrl}
                    size="md"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <SheetTitle className="text-base leading-snug font-semibold tracking-tight text-text-main">
                      {activeData.name}
                    </SheetTitle>

                    {isPending && (
                      <span className="inline-flex items-center rounded-md border border-amber-200/80 bg-amber-50/90 px-2 py-0.5 text-[10px] font-medium tracking-tight text-amber-700">
                        Chờ thẩm định
                      </span>
                    )}
                    {isVerified && (
                      <span className="inline-flex items-center rounded-md border border-emerald-200/80 bg-emerald-50/90 px-2 py-0.5 text-[10px] font-medium tracking-tight text-emerald-700">
                        Đã xác thực
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center rounded-md border border-rose-200/80 bg-rose-50/90 px-2 py-0.5 text-[10px] font-medium tracking-tight text-rose-700">
                        Bị từ chối
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                    <div className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-700">
                      <span>MST:</span>
                      <span className="font-semibold">
                        {activeData.taxCode || "—"}
                      </span>
                      {activeData.taxCode && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={handleCopyTaxCode}
                                className="inline-flex size-4 cursor-pointer items-center justify-center rounded text-slate-400 transition-colors hover:text-slate-800"
                                aria-label="Sao chép mã số thuế"
                              >
                                {hasCopiedTax ? (
                                  <CheckCheck className="size-3 text-emerald-600" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                            }
                          />
                          <TooltipPanel>
                            {hasCopiedTax
                              ? "Đã sao chép!"
                              : "Sao chép MST tra cứu"}
                          </TooltipPanel>
                        </Tooltip>
                      )}
                    </div>

                    {isVerified && (
                      <CheckCircle2 className="size-3.5 text-status-success" />
                    )}

                    {activeData.id && (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <a
                              href={PATHS.COMPANY_DETAIL.replace(
                                ":id",
                                activeData.id,
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex size-5 cursor-pointer items-center justify-center rounded text-text-muted transition-colors hover:text-primary"
                              aria-label="Xem trang công ty (mở tab mới)"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          }
                        />
                        <TooltipPanel>
                          Xem trang công ty (mở tab mới)
                        </TooltipPanel>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Segmented Flat Metric Row */}
            <div className="mt-3.5 grid grid-cols-3 divide-x divide-border/60 rounded-xl border border-border/70 bg-slate-50/60 p-2.5">
              <div className="pr-2">
                <p className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
                  Mã số thuế
                </p>
                <p className="mt-0.5 truncate font-mono text-xs font-semibold text-primary">
                  {activeData.taxCode || "—"}
                </p>
              </div>

              <div className="px-2.5">
                <p className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
                  Ngày gửi hồ sơ
                </p>
                <p className="mt-0.5 truncate text-xs font-semibold text-text-main">
                  {dayjs(activeData.createdAt).format("DD/MM/YYYY")}
                </p>
              </div>

              <div className="pl-2.5">
                <p className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
                  Tin tuyển dụng
                </p>
                <p className="mt-0.5 truncate text-xs font-semibold text-text-main">
                  {detail?.jobPostingCount ?? 0} tin đăng
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* BODY: Clean Scannable Layout */}
          <div className="flex-1 space-y-5 overflow-y-auto p-5 pb-6">
            {/* Banner cảnh báo nếu hồ sơ bị từ chối */}
            {isRejected && (
              <div className="rounded-xl border border-rose-200/90 bg-rose-50/70 p-3.5 text-xs text-rose-900">
                <div className="mb-1 flex items-center gap-1.5 font-semibold text-rose-950">
                  <AlertTriangle className="size-4 shrink-0 text-rose-600" />
                  <span>Hồ sơ đã bị từ chối thẩm định</span>
                </div>
                <p className="leading-relaxed text-rose-800">
                  Doanh nghiệp chưa đạt yêu cầu xác thực pháp nhân. Bạn có thể
                  kiểm tra lại thông số đối soát hoặc phê duyệt nếu doanh nghiệp
                  đã bổ sung hợp lệ.
                </p>
              </div>
            )}

            {/* Flat Specs Grid (2 columns) */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-slate-50/40 p-2.5 transition-colors hover:bg-slate-50/80">
                <div className="shrink-0 text-primary">
                  <Mail className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
                    Email công ty
                  </p>
                  <p className="truncate text-xs font-semibold text-text-main">
                    {activeData.email || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-slate-50/40 p-2.5 transition-colors hover:bg-slate-50/80">
                <div className="shrink-0 text-primary">
                  <Phone className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
                    Số điện thoại
                  </p>
                  <p className="truncate text-xs font-semibold text-text-main">
                    {activeData.phone || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-slate-50/40 p-2.5 transition-colors hover:bg-slate-50/80">
                <div className="shrink-0 text-primary">
                  <Users className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
                    Thành viên
                  </p>
                  <p className="truncate text-xs font-semibold text-text-main">
                    {detail?.memberCount ?? 1} nhân sự
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-slate-50/40 p-2.5 transition-colors hover:bg-slate-50/80">
                <div className="shrink-0 text-primary">
                  <Briefcase className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
                    Quy mô tin
                  </p>
                  <p className="truncate text-xs font-semibold text-text-main">
                    {detail?.jobPostingCount ?? 0} tin tuyển
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-slate-50/40 p-2.5 transition-colors hover:bg-slate-50/80">
                <div className="shrink-0 text-primary">
                  <Globe className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
                    Website
                  </p>
                  {activeData.website ? (
                    <a
                      href={
                        /^https?:\/\//i.test(activeData.website)
                          ? activeData.website
                          : `https://${activeData.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 truncate text-xs font-semibold text-primary hover:underline"
                    >
                      <span className="truncate">
                        {activeData.website.replace(/^https?:\/\//, "")}
                      </span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  ) : (
                    <p className="truncate text-xs font-semibold text-text-main">
                      —
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-slate-50/40 p-2.5 transition-colors hover:bg-slate-50/80">
                <div className="shrink-0 text-primary">
                  <User className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
                    Đại diện pháp luật
                  </p>
                  <p className="truncate text-xs font-semibold text-text-main">
                    {activeData.owner?.fullName || "—"}
                  </p>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-2.5 rounded-xl border border-border/70 bg-slate-50/40 p-2.5 transition-colors hover:bg-slate-50/80">
                <div className="shrink-0 text-primary">
                  <MapPin className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium tracking-wider text-text-muted uppercase">
                    Trụ sở chính
                  </p>
                  <p className="truncate text-xs font-semibold text-text-main">
                    {activeData.address || "Chưa cập nhật địa chỉ trụ sở"}
                  </p>
                </div>
              </div>
            </div>

            {/* Lưu ý đối soát pháp lý: Flat Architectural Callout */}
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 text-xs text-amber-950">
              <div className="mb-1 flex items-center gap-1.5 font-semibold text-amber-950">
                <ShieldAlert className="size-4 shrink-0 text-amber-600" />
                <span>Lưu ý đối soát pháp lý</span>
              </div>
              <p className="leading-relaxed text-amber-800">
                Vui lòng đối chiếu mã số thuế{" "}
                <strong className="font-semibold text-amber-950">
                  {activeData.taxCode}
                </strong>{" "}
                với Cổng thông tin Quốc gia về Đăng ký Doanh nghiệp trước khi
                duyệt cấp tích xanh xác thực.
              </p>
            </div>

            {/* Giới thiệu doanh nghiệp */}
            {isLoadingDetail ? (
              <div className="space-y-2 pt-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : (
              <section className="space-y-1.5">
                <h4 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                  Giới thiệu doanh nghiệp
                </h4>
                <p className="text-xs leading-relaxed whitespace-pre-line text-text-main sm:text-sm">
                  {detail?.description || (
                    <span className="text-slate-400 italic">
                      Doanh nghiệp chưa bổ sung mô tả giới thiệu chi tiết.
                    </span>
                  )}
                </p>
              </section>
            )}

            {/* Thông tin Người đại diện / Chủ sở hữu */}
            {activeData.owner && (
              <section className="rounded-xl border border-border/70 bg-slate-50/40 p-3.5">
                <div className="mb-2.5 flex items-center justify-between">
                  <h4 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                    Người đại diện
                  </h4>
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Chủ sở hữu
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={activeData.owner.avatarUrl || ""}
                    name={activeData.owner.fullName}
                    className="size-8 rounded-full border border-border/60"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-text-main">
                      {activeData.owner.fullName}
                    </p>
                    <p className="truncate text-[11px] text-text-muted">
                      {activeData.owner.email}
                      {activeData.owner.phone && ` • ${activeData.owner.phone}`}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Audit Row: Thời gian */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-text-muted">
              <span>
                Ngày gửi:{" "}
                <strong className="font-medium text-slate-700">
                  {dayjs(activeData.createdAt).format("DD/MM/YYYY HH:mm")}
                </strong>
              </span>
              {activeData.verifiedAt && (
                <span>
                  Đã duyệt:{" "}
                  <strong className="font-medium text-emerald-700">
                    {dayjs(activeData.verifiedAt).format("DD/MM/YYYY HH:mm")}
                  </strong>
                </span>
              )}
            </div>
          </div>

          {/* STICKY FOOTER: Flat Premium Action Bar */}
          <div className="shrink-0 border-t border-border/80 bg-surface p-4">
            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                className="flex-1 justify-center rounded-xl py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                icon={X}
                onClick={() => {
                  setRejectionReason("");
                  setReasonError("");
                  setIsRejectDialogOpen(true);
                }}
                disabled={isRejected || verifyMutation.isPending}
              >
                <span>Từ chối</span>
              </Button>

              <Button
                variant="primary"
                className="flex-1 justify-center rounded-xl bg-emerald-600! py-2.5 text-xs font-semibold text-white! hover:bg-emerald-700!"
                icon={Check}
                onClick={() => setIsApproveDialogOpen(true)}
                disabled={isVerified || verifyMutation.isPending}
              >
                <span>Phê duyệt </span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal xác nhận Duyệt doanh nghiệp: Flat Premium Style */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="w-full sm:max-w-md p-5 sm:p-6">
          <DialogHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-status-success/10 text-status-success">
              <ShieldCheck className="size-5" />
            </div>
            <DialogTitle className="text-base font-semibold text-text-main">
              Xác nhận phê duyệt doanh nghiệp
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs leading-relaxed text-text-muted">
              Bạn đang phê duyệt hồ sơ pháp lý của{" "}
              <strong className="text-text-main">{activeData.name}</strong>{" "}
              (MST: {activeData.taxCode}). Doanh nghiệp sẽ nhận tích xanh xác
              thực và quyền xuất bản tin tuyển dụng công khai.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={verifyMutation.isPending}
              className="h-9! px-4! text-xs! font-medium!"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon={Check}
              iconSize={14}
              isLoading={verifyMutation.isPending}
              onClick={handleConfirmApprove}
              className="h-9! bg-status-success! px-4! text-xs! font-semibold! text-white! hover:bg-status-success/90!"
            >
              Xác nhận duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal nhập lý do Từ chối doanh nghiệp: Flat Premium Style */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="w-full sm:max-w-md p-5 sm:p-6">
          <DialogHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-status-error/10 text-status-error">
              <XCircle className="size-5" />
            </div>
            <DialogTitle className="text-base font-semibold text-text-main">
              Từ chối hồ sơ pháp lý doanh nghiệp
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs leading-relaxed text-text-muted">
              Vui lòng nêu rõ lý do từ chối hồ sơ của{" "}
              <strong className="text-text-main">{activeData.name}</strong>. Lý
              do sẽ được thông báo trực tiếp đến chủ sở hữu để họ chỉnh sửa.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-1.5">
            <label
              htmlFor="rejection-reason"
              className="text-xs font-semibold text-text-main"
            >
              Lý do từ chối <span className="text-status-error">*</span>
            </label>
            <textarea
              id="rejection-reason"
              rows={4}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (reasonError) setReasonError("");
              }}
              placeholder="Ví dụ: Giấy phép ĐKKD mờ không đọc được thông tin, hoặc mã số thuế không khớp với tên doanh nghiệp..."
              className={cn(
                "w-full rounded-xl border border-border bg-bg p-3 text-xs leading-relaxed text-text-main placeholder:text-text-muted focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary/20 focus:outline-none",
                reasonError && "border-status-error focus:border-status-error",
              )}
            />
            {reasonError && (
              <p className="text-[11px] font-medium text-status-error">
                {reasonError}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={verifyMutation.isPending}
              className="h-9! px-4! text-xs! font-medium!"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon={X}
              iconSize={14}
              isLoading={verifyMutation.isPending}
              onClick={handleConfirmReject}
              className="h-9! bg-status-error! px-4! text-xs! font-semibold! text-white! hover:bg-status-error/90!"
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CompanyInspectionSheet;
