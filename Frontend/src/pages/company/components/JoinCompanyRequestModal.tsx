import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Button from "@/components/common/Button";
import { useSubmitJoinRequest } from "@/hooks/queries/useCompany";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/api/errorHandler";
import type { CompanyItem } from "@/types/company";

export interface JoinCompanyRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyItem | null;
  onSuccess?: () => void;
}

export function JoinCompanyRequestModal({
  open,
  onOpenChange,
  company,
  onSuccess,
}: JoinCompanyRequestModalProps) {
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submitMutation = useSubmitJoinRequest();

  const handleClose = () => {
    if (submitMutation.isPending) return;
    setMessage("");
    setErrorMsg(null);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id) return;

    setErrorMsg(null);

    try {
      await submitMutation.mutateAsync({
        companyId: company.id,
        payload: {
          message: message.trim() || undefined,
        },
      });

      toast({
        title: "Gửi yêu cầu thành công",
        description: `Yêu cầu gia nhập ${company.name} đã được gửi tới Chủ sở hữu doanh nghiệp.`,
      });

      handleClose();
      onSuccess?.();
    } catch (err: unknown) {
      const parsed = getApiErrorMessage(
        err,
        "Không thể gửi yêu cầu gia nhập. Vui lòng thử lại sau.",
      );
      setErrorMsg(parsed);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-0 text-left">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-base font-semibold text-text-main">
                Yêu cầu gia nhập doanh nghiệp
              </DialogTitle>
              <DialogDescription className="mt-0.5 truncate text-xs text-text-muted">
                {company?.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          <p className="text-xs leading-relaxed text-text-muted">
            Yêu cầu của bạn sẽ được gửi tới Quản trị viên của{" "}
            <span className="font-medium text-text-main">{company?.name}</span>.
            Sau khi được phê duyệt, bạn sẽ trở thành thành viên chính thức trong
            đội ngũ tuyển dụng.
          </p>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <label
                htmlFor="join-message"
                className="font-medium text-text-main"
              >
                Lời nhắn tự giới thiệu (tùy chọn)
              </label>
              <span className="text-[11px] text-text-muted">
                {message.length} / 1000
              </span>
            </div>
            <textarea
              id="join-message"
              rows={4}
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Chia sẻ ngắn gọn về chuyên môn tuyển dụng hoặc lý do bạn mong muốn đồng hành cùng doanh nghiệp..."
              className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-xs text-text-main transition-colors outline-none placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-status-error/30 bg-status-error/10 px-3.5 py-2.5 text-xs text-status-error">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="px-4! py-2! text-xs!"
              onClick={handleClose}
              disabled={submitMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-4! py-2! text-xs!"
              isLoading={submitMutation.isPending}
            >
              Gửi yêu cầu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default JoinCompanyRequestModal;
