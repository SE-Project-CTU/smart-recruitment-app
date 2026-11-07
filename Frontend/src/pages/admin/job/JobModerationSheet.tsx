import { useState } from "react";
import {
  Briefcase,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Users,
  Award,
  Layers,
  FileText,
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
import { useJobPostingDetail } from "@/hooks/queries/useJob";
import { useModerateJobPosting } from "@/hooks/queries/useAdmin";
import type { AdminJobPostingItem } from "@/types/admin";
import {
  formatSalaryRange,
  getJobLevelLabel,
  getJobTypeLabel,
  getWorkModeLabel,
} from "@/utils/jobHelpers";
import { cn } from "@/lib/utils";

dayjs.locale("vi");

interface JobModerationSheetProps {
  job: AdminJobPostingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function JobModerationSheet({
  job,
  isOpen,
  onClose,
  onSuccess,
}: JobModerationSheetProps) {
  const jobId = job?.id;

  // Lấy chi tiết tin tuyển dụng bao gồm Mô tả, Yêu cầu, Đãi ngộ, Kỹ năng
  const { data: jobDetail } = useJobPostingDetail(
    isOpen ? jobId : undefined,
  );

  const moderateMutation = useModerateJobPosting();

  // State dialog xác nhận Duyệt
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);

  // State dialog Từ chối kèm lý do
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  if (!job) return null;

  const currentStatus = (job.status || "PendingReview").toUpperCase();
  const isPending =
    currentStatus === "PENDINGREVIEW" || currentStatus === "PENDING_APPROVAL";
  const isPublished = currentStatus === "PUBLISHED";
  const isRejected = currentStatus === "REJECTED";
  const isExpired = currentStatus === "EXPIRED";
  const isClosed = currentStatus === "CLOSED";

  // Thao tác duyệt xuất bản
  const handleConfirmApprove = async () => {
    if (!jobId) return;
    try {
      await moderateMutation.mutateAsync({
        id: jobId,
        payload: { status: "Published" },
      });
      setIsApproveDialogOpen(false);
      onSuccess?.();
      onClose();
    } catch {
      // Error handled by hook toast
    }
  };

  // Thao tác từ chối
  const handleConfirmReject = async () => {
    if (!jobId) return;
    if (!rejectionReason.trim()) {
      setReasonError("Vui lòng nêu rõ lý do vi phạm hoặc cần sửa đổi tin.");
      return;
    }

    try {
      await moderateMutation.mutateAsync({
        id: jobId,
        payload: {
          status: "Rejected",
          rejectionReason: rejectionReason.trim(),
        },
      });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setReasonError("");
      onSuccess?.();
      onClose();
    } catch {
      // Error handled by hook toast
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-2xl"
        >
          {/* Header */}
          <SheetHeader className="border-b border-border/70 p-6 pb-5 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <CompanyLogo
                  name={job.companyName}
                  logoUrl={job.companyLogoUrl}
                  size="md"
                />
                <div className="min-w-0">
                  <SheetTitle className="text-lg font-bold text-text-main line-clamp-1">
                    {job.title}
                  </SheetTitle>
                  <SheetDescription className="mt-0.5 text-xs font-medium text-text-muted">
                    {job.companyName}
                  </SheetDescription>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    <Clock className="size-3.5" />
                    Chờ duyệt
                  </span>
                )}
                {isPublished && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="size-3.5" />
                    Đã xuất bản
                  </span>
                )}
                {isRejected && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                    <XCircle className="size-3.5" />
                    Bị từ chối
                  </span>
                )}
                {isExpired && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Hết hạn
                  </span>
                )}
                {isClosed && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Đã đóng
                  </span>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* Body Content */}
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* 1. Lưới tóm tắt đãi ngộ & Thông số */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/80 bg-surface p-3.5">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase">
                  <Coins className="size-3.5 text-primary" />
                  Mức thu nhập
                </span>
                <span className="mt-1.5 block text-xs font-bold text-emerald-700">
                  {formatSalaryRange(
                    job.salaryMin,
                    job.salaryMax,
                    job.salaryNegotiable,
                  )}
                </span>
              </div>

              <div className="rounded-2xl border border-border/80 bg-surface p-3.5">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase">
                  <MapPin className="size-3.5 text-primary" />
                  Địa bàn làm việc
                </span>
                <span className="mt-1.5 block truncate text-xs font-semibold text-text-main">
                  {job.wardName ? `${job.wardName}, ` : ""}
                  {job.provinceName}
                </span>
              </div>

              <div className="rounded-2xl border border-border/80 bg-surface p-3.5">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase">
                  <Users className="size-3.5 text-primary" />
                  Số lượng tuyển
                </span>
                <span className="mt-1.5 block text-xs font-bold text-text-main">
                  {job.vacancies} nhân sự
                </span>
              </div>

              {jobDetail && (
                <>
                  <div className="rounded-2xl border border-border/80 bg-surface p-3.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase">
                      <Award className="size-3.5 text-primary" />
                      Cấp bậc
                    </span>
                    <span className="mt-1.5 block text-xs font-semibold text-text-main">
                      {getJobLevelLabel(jobDetail.jobLevel)}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-surface p-3.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase">
                      <Briefcase className="size-3.5 text-primary" />
                      Hình thức
                    </span>
                    <span className="mt-1.5 block text-xs font-semibold text-text-main">
                      {getJobTypeLabel(jobDetail.jobType)}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-surface p-3.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase">
                      <Layers className="size-3.5 text-primary" />
                      Chế độ làm việc
                    </span>
                    <span className="mt-1.5 block text-xs font-semibold text-text-main">
                      {getWorkModeLabel(jobDetail.workMode)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 2. Danh sách Kỹ năng yêu cầu */}
            {jobDetail?.skills && jobDetail.skills.length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-surface p-4">
                <h4 className="text-xs font-bold tracking-wider text-text-muted uppercase">
                  Kỹ năng chuyên môn yêu cầu
                </h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {jobDetail.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Mô tả công việc */}
            <div className="rounded-2xl border border-border/80 bg-surface p-5">
              <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-text-muted uppercase">
                <FileText className="size-4 text-primary" />
                Mô tả chi tiết công việc
              </h4>
              <div className="prose prose-xs mt-3 max-w-none text-xs leading-relaxed text-text-main">
                {jobDetail?.description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: jobDetail.description }}
                    className="space-y-2 whitespace-pre-line"
                  />
                ) : (
                  <p className="text-text-muted italic">
                    Chưa có nội dung mô tả công việc.
                  </p>
                )}
              </div>
            </div>

            {/* 4. Yêu cầu ứng viên */}
            {jobDetail?.requirements && (
              <div className="rounded-2xl border border-border/80 bg-surface p-5">
                <h4 className="text-xs font-bold tracking-wider text-text-muted uppercase">
                  Yêu cầu ứng viên
                </h4>
                <div className="prose prose-xs mt-3 max-w-none text-xs leading-relaxed text-text-main">
                  <div
                    dangerouslySetInnerHTML={{ __html: jobDetail.requirements }}
                    className="space-y-2 whitespace-pre-line"
                  />
                </div>
              </div>
            )}

            {/* 5. Quyền lợi & Chế độ đãi ngộ */}
            {jobDetail?.benefits && (
              <div className="rounded-2xl border border-border/80 bg-surface p-5">
                <h4 className="text-xs font-bold tracking-wider text-text-muted uppercase">
                  Quyền lợi & Đãi ngộ
                </h4>
                <div className="prose prose-xs mt-3 max-w-none text-xs leading-relaxed text-text-main">
                  <div
                    dangerouslySetInnerHTML={{ __html: jobDetail.benefits }}
                    className="space-y-2 whitespace-pre-line"
                  />
                </div>
              </div>
            )}

            {/* Thời hạn nộp hồ sơ & Ngày tạo */}
            <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-bg/50 p-4 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
              <div>
                Hạn nộp hồ sơ:{" "}
                <strong className="font-semibold text-text-main">
                  {job.deadline
                    ? dayjs(job.deadline).format("DD/MM/YYYY")
                    : "Không giới hạn"}
                </strong>
              </div>
              <div>
                Khởi tạo ngày:{" "}
                <strong className="font-semibold text-text-main">
                  {dayjs(job.createdAt).format("DD/MM/YYYY HH:mm")}
                </strong>
              </div>
            </div>
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
              {/* Nút từ chối tin */}
              <Button
                variant="secondary"
                icon={XCircle}
                iconSize={14}
                onClick={() => {
                  setRejectionReason("");
                  setReasonError("");
                  setIsRejectDialogOpen(true);
                }}
                disabled={isRejected || moderateMutation.isPending}
                className={cn(
                  "h-9! px-4! text-xs! font-semibold! text-rose-600! hover:bg-rose-50! hover:text-rose-700!",
                  isRejected && "opacity-50",
                )}
              >
                Từ chối tin
              </Button>

              {/* Nút phê duyệt xuất bản */}
              <Button
                variant="primary"
                icon={CheckCircle2}
                iconSize={14}
                onClick={() => setIsApproveDialogOpen(true)}
                disabled={isPublished || moderateMutation.isPending}
                className="h-9! bg-emerald-600! px-4! text-xs! font-semibold! text-white! hover:bg-emerald-700!"
              >
                Phê duyệt xuất bản
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Modal xác nhận Duyệt tin tuyển dụng */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-text-main">
              Xác nhận phê duyệt xuất bản
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-text-muted">
              Tin tuyển dụng <strong className="text-text-main">{job.title}</strong> của{" "}
              <strong className="text-text-main">{job.companyName}</strong> sẽ được đăng tải
              công khai ngay lập tức lên sàn việc làm SmartHire để các ứng viên có thể tìm kiếm
              và ứng tuyển.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={moderateMutation.isPending}
              className="h-9! px-4! text-xs! font-medium!"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle2}
              iconSize={14}
              isLoading={moderateMutation.isPending}
              onClick={handleConfirmApprove}
              className="h-9! bg-emerald-600! px-4! text-xs! font-semibold! text-white! hover:bg-emerald-700!"
            >
              Xác nhận xuất bản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal nhập lý do Từ chối tin tuyển dụng */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <XCircle className="size-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-text-main">
              Từ chối tin tuyển dụng
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-text-muted">
              Vui lòng nêu rõ lý do từ chối tin{" "}
              <strong className="text-text-main">{job.title}</strong> để nhà tuyển dụng có thể
              chỉnh sửa và gửi duyệt lại.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-1.5">
            <label
              htmlFor="job-rejection-reason"
              className="text-xs font-semibold text-text-main"
            >
              Lý do từ chối <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="job-rejection-reason"
              rows={4}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (reasonError) setReasonError("");
              }}
              placeholder="Ví dụ: Mô tả công việc chưa rõ ràng, mức lương không phù hợp, hoặc vi phạm chính sách đăng tin của nền tảng..."
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
              disabled={moderateMutation.isPending}
              className="h-9! px-4! text-xs! font-medium!"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon={XCircle}
              iconSize={14}
              isLoading={moderateMutation.isPending}
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
