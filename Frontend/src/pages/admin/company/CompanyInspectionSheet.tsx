import { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  User,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
import { useAdminCompanyDetail, useVerifyCompany } from "@/hooks/queries/useAdmin";
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

  // Lấy chi tiết doanh nghiệp bao gồm MemberCount, JobPostingCount, Description
  const { data: detail } = useAdminCompanyDetail(
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

  const currentStatus = (activeData.verificationStatus || "Pending").toUpperCase();
  const isPending = currentStatus === "PENDING";
  const isVerified = currentStatus === "VERIFIED";
  const isRejected = currentStatus === "REJECTED";

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
          side="right"
          className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl"
        >
          {/* Header */}
          <SheetHeader className="border-b border-border/70 p-6 pb-5 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <CompanyLogo
                  name={activeData.name}
                  logoUrl={activeData.logoUrl}
                  size="md"
                />
                <div>
                  <SheetTitle className="text-lg font-bold text-text-main">
                    {activeData.name}
                  </SheetTitle>
                  <SheetDescription className="mt-0.5 text-xs text-text-muted">
                    Mã số thuế:{" "}
                    <span className="font-semibold text-text-main">
                      {activeData.taxCode || "Chưa cập nhật"}
                    </span>
                  </SheetDescription>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    <Clock className="size-3.5" />
                    Chờ thẩm định
                  </span>
                )}
                {isVerified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="size-3.5" />
                    Đã xác thực
                  </span>
                )}
                {isRejected && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                    <XCircle className="size-3.5" />
                    Bị từ chối
                  </span>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* Body Content - Scrollable */}
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* 1. Hồ sơ liên hệ & Pháp nhân */}
            <div className="rounded-2xl border border-border/80 bg-surface p-4">
              <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-text-muted uppercase">
                <Building2 className="size-4 text-primary" />
                Thông tin pháp nhân
              </h4>

              <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 text-xs">
                  <Mail className="size-4 text-text-muted" />
                  <div className="min-w-0">
                    <span className="block text-[11px] text-text-muted">Email công ty</span>
                    <span className="truncate font-medium text-text-main">
                      {activeData.email || "—"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <Phone className="size-4 text-text-muted" />
                  <div>
                    <span className="block text-[11px] text-text-muted">Số điện thoại</span>
                    <span className="font-medium text-text-main">
                      {activeData.phone || "—"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs sm:col-span-2">
                  <MapPin className="size-4 shrink-0 text-text-muted" />
                  <div className="min-w-0">
                    <span className="block text-[11px] text-text-muted">Trụ sở chính</span>
                    <span className="font-medium text-text-main">
                      {activeData.address || "Chưa cập nhật địa chỉ trụ sở"}
                    </span>
                  </div>
                </div>

                {activeData.website && (
                  <div className="flex items-center gap-2.5 text-xs sm:col-span-2">
                    <Globe className="size-4 shrink-0 text-text-muted" />
                    <div className="min-w-0">
                      <span className="block text-[11px] text-text-muted">Website chính thức</span>
                      <a
                        href={
                          activeData.website.startsWith("http")
                            ? activeData.website
                            : `https://${activeData.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        {activeData.website}
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Thông tin Người đại diện / Chủ sở hữu */}
            <div className="rounded-2xl border border-border/80 bg-surface p-4">
              <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-text-muted uppercase">
                <User className="size-4 text-primary" />
                Chủ sở hữu / Người đại diện
              </h4>

              {activeData.owner ? (
                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Họ và tên:</span>
                    <span className="font-semibold text-text-main">
                      {activeData.owner.fullName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Email tài khoản:</span>
                    <span className="font-medium text-text-main">
                      {activeData.owner.email}
                    </span>
                  </div>
                  {activeData.owner.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Số điện thoại:</span>
                      <span className="font-medium text-text-main">
                        {activeData.owner.phone}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs text-text-muted italic">
                  Chưa gán thông tin chủ sở hữu tài khoản.
                </p>
              )}
            </div>

            {/* 3. Thống kê quy mô & hoạt động */}
            {detail && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-surface p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-text-main">
                      {detail.memberCount}
                    </span>
                    <span className="text-xs text-text-muted">Thành viên Workspace</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-surface p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Briefcase className="size-5" />
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-text-main">
                      {detail.jobPostingCount}
                    </span>
                    <span className="text-xs text-text-muted">Tin tuyển dụng</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Giới thiệu doanh nghiệp */}
            <div className="rounded-2xl border border-border/80 bg-surface p-4">
              <h4 className="text-xs font-bold tracking-wider text-text-muted uppercase">
                Giới thiệu doanh nghiệp
              </h4>
              <p className="mt-2.5 text-xs leading-relaxed text-text-main">
                {detail?.description || "Doanh nghiệp chưa bổ sung mô tả giới thiệu."}
              </p>
            </div>

            {/* 5. Thông tin hồ sơ pháp lý / Giấy phép kinh doanh */}
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 shrink-0 text-amber-600" />
                <div className="text-xs">
                  <h5 className="font-bold text-amber-950">
                    Lưu ý đối soát pháp lý
                  </h5>
                  <p className="mt-1 leading-relaxed text-amber-800">
                    Vui lòng đối chiếu mã số thuế{" "}
                    <strong className="font-semibold text-amber-950">
                      {activeData.taxCode}
                    </strong>{" "}
                    với Cổng thông tin Quốc gia về Đăng ký Doanh nghiệp trước khi phê duyệt.
                  </p>
                </div>
              </div>
            </div>

            {/* Thông tin thời gian gửi */}
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Ngày gửi hồ sơ:</span>
              <span className="font-medium text-text-main">
                {dayjs(activeData.createdAt).format("DD/MM/YYYY HH:mm")}
              </span>
            </div>
            {activeData.verifiedAt && (
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Thời điểm thẩm định:</span>
                <span className="font-medium text-text-main">
                  {dayjs(activeData.verifiedAt).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <SheetFooter className="border-t border-border/70 p-4 sm:justify-between">
            <Button
              variant="secondary"
              onClick={onClose}
              className="h-9! px-4! text-xs! font-medium!"
            >
              Đóng
            </Button>

            <div className="flex items-center gap-2">
              {/* Nút từ chối */}
              <Button
                variant="secondary"
                icon={XCircle}
                iconSize={14}
                onClick={() => {
                  setRejectionReason("");
                  setReasonError("");
                  setIsRejectDialogOpen(true);
                }}
                disabled={isRejected || verifyMutation.isPending}
                className={cn(
                  "h-9! px-4! text-xs! font-semibold! text-rose-600! hover:bg-rose-50! hover:text-rose-700!",
                  isRejected && "opacity-50",
                )}
              >
                Từ chối hồ sơ
              </Button>

              {/* Nút duyệt */}
              <Button
                variant="primary"
                icon={CheckCircle2}
                iconSize={14}
                onClick={() => setIsApproveDialogOpen(true)}
                disabled={isVerified || verifyMutation.isPending}
                className="h-9! bg-emerald-600! px-4! text-xs! font-semibold! text-white! hover:bg-emerald-700!"
              >
                Phê duyệt doanh nghiệp
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Modal xác nhận Duyệt doanh nghiệp */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="size-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-text-main">
              Xác nhận phê duyệt doanh nghiệp
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-text-muted">
              Bạn đang phê duyệt hồ sơ pháp lý của doanh nghiệp{" "}
              <strong className="text-text-main">{activeData.name}</strong> (MST:{" "}
              {activeData.taxCode}). Sau khi duyệt, doanh nghiệp sẽ được cấp tích xanh
              xác thực và quyền xuất bản tin tuyển dụng công khai.
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
              icon={CheckCircle2}
              iconSize={14}
              isLoading={verifyMutation.isPending}
              onClick={handleConfirmApprove}
              className="h-9! bg-emerald-600! px-4! text-xs! font-semibold! text-white! hover:bg-emerald-700!"
            >
              Xác nhận duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal nhập lý do Từ chối doanh nghiệp */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <XCircle className="size-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-text-main">
              Từ chối hồ sơ pháp lý doanh nghiệp
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-text-muted">
              Vui lòng nêu rõ lý do từ chối hồ sơ của{" "}
              <strong className="text-text-main">{activeData.name}</strong>. Lý do này sẽ
              được gửi trực tiếp đến hộp thư và thông báo của chủ sở hữu doanh nghiệp để họ
              cập nhật lại giấy tờ.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-1.5">
            <label
              htmlFor="rejection-reason"
              className="text-xs font-semibold text-text-main"
            >
              Lý do từ chối <span className="text-rose-500">*</span>
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
                "w-full rounded-xl border border-border bg-slate-50/50 p-3 text-xs leading-relaxed text-text-main placeholder:text-text-muted focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20 focus:outline-none",
                reasonError && "border-rose-400 focus:border-rose-500",
              )}
            />
            {reasonError && (
              <p className="text-[11px] font-medium text-rose-600">{reasonError}</p>
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
              icon={XCircle}
              iconSize={14}
              isLoading={verifyMutation.isPending}
              onClick={handleConfirmReject}
              className="h-9! bg-rose-600! px-4! text-xs! font-semibold! text-white! hover:bg-rose-700!"
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
