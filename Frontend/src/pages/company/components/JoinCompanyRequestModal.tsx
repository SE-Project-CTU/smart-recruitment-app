import { useState } from "react";
import { UserPlus, AlertCircle } from "lucide-react";
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
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-text-main">
                Yêu cầu gia nhập doanh nghiệp
              </DialogTitle>
              <DialogDescription className="text-xs text-text-muted">
                {company?.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          <p className="text-xs leading-relaxed text-text-muted">
            Yêu cầu của bạn sẽ được gửi tới Quản trị viên (Chủ sở hữu) của{" "}
            <span className="font-medium text-text-main">{company?.name}</span>.
            Sau khi được phê duyệt, bạn sẽ trở thành thành viên chính thức và có
            thể tham gia tuyển dụng.
          </p>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="join-message"
                className="text-xs font-medium text-text-main"
              >
                Lời nhắn tự giới thiệu (tùy chọn)
              </label>
              <span className="text-[11px] text-text-muted">
                {message.length}/1000
              </span>
            </div>
            <textarea
              id="join-message"
              rows={4}
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="VD: Tôi là Recruiter chuyên mảng Công nghệ thông tin với 3 năm kinh nghiệm, rất mong được gia nhập đội ngũ tuyển dụng của quý công ty..."
              className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-xs text-text-main transition-colors outline-none placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="text-xs px-3.5 py-2"
              onClick={handleClose}
              disabled={submitMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="text-xs px-3.5 py-2"
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
