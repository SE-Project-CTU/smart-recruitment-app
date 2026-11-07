import { useState } from "react";
import {
  Megaphone,
  Globe,
  UserCheck,
  Building2,
  AlertCircle,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/common/Button";
import { useSendSystemAlert } from "@/hooks/queries/useAdmin";
import type { AdminSystemAlertTarget } from "@/types/admin";
import { cn } from "cn";

interface AdminSendNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const TARGET_OPTIONS: Array<{
  value: AdminSystemAlertTarget;
  label: string;
  description: string;
  icon: typeof Globe;
}> = [
  {
    value: "SystemAll",
    label: "Toàn bộ hệ thống",
    description: "Gửi tới tất cả người dùng đang hoạt động",
    icon: Globe,
  },
  {
    value: "Candidate",
    label: "Ứng viên",
    description: "Chỉ phát tới tài khoản tìm việc",
    icon: UserCheck,
  },
  {
    value: "Recruiter",
    label: "Nhà tuyển dụng",
    description: "Chỉ phát tới tài khoản doanh nghiệp / HR",
    icon: Building2,
  },
];

export function AdminSendNotificationModal({
  open,
  onOpenChange,
  onSuccess,
}: AdminSendNotificationModalProps) {
  const [target, setTarget] = useState<AdminSystemAlertTarget>("SystemAll");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);

  const sendAlertMutation = useSendSystemAlert();

  const handleClose = () => {
    if (sendAlertMutation.isPending) return;
    onOpenChange(false);
  };

  const handleReset = () => {
    setTitle("");
    setBody("");
    setTarget("SystemAll");
    setTitleError(null);
    setBodyError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle) {
      setTitleError("Vui lòng nhập tiêu đề thông báo");
      hasError = true;
    } else if (trimmedTitle.length < 3) {
      setTitleError("Tiêu đề phải có ít nhất 3 ký tự");
      hasError = true;
    } else if (trimmedTitle.length > 200) {
      setTitleError("Tiêu đề không được vượt quá 200 ký tự");
      hasError = true;
    } else {
      setTitleError(null);
    }

    if (!trimmedBody) {
      setBodyError("Vui lòng nhập nội dung thông báo");
      hasError = true;
    } else if (trimmedBody.length < 5) {
      setBodyError("Nội dung phải có ít nhất 5 ký tự");
      hasError = true;
    } else if (trimmedBody.length > 2000) {
      setBodyError("Nội dung không được vượt quá 2000 ký tự");
      hasError = true;
    } else {
      setBodyError(null);
    }

    if (hasError) return;

    sendAlertMutation.mutate(
      {
        target,
        title: trimmedTitle,
        body: trimmedBody,
      },
      {
        onSuccess: () => {
          handleReset();
          onOpenChange(false);
          onSuccess?.();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-h-[92vh] gap-0 overflow-y-auto rounded-2xl border border-border/80 bg-surface p-0 sm:max-w-xl"
        showCloseButton={!sendAlertMutation.isPending}
      >
        {/* Header */}
        <div className="border-b border-border/60 bg-linear-to-b from-primary/5 via-transparent to-transparent p-6">
          <DialogHeader className="gap-1.5 text-left">
            <div className="flex items-center gap-2.5">
              <div>
                <DialogTitle className="text-base font-semibold text-text-main">
                  Phát thông báo hệ thống
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-text-muted">
                  Gửi thông báo cho người dùng trên toàn hệ thống
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Đối tượng nhận */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text-main">
              Đối tượng <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {TARGET_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = target === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTarget(opt.value)}
                    disabled={sendAlertMutation.isPending}
                    className={cn(
                      "flex cursor-pointer flex-col items-start rounded-xl border p-3 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                        : "border-border/70 bg-bg/50 text-text-muted hover:border-border hover:bg-bg hover:text-text-main",
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          isSelected ? "text-primary" : "text-text-muted",
                        )}
                      />
                      <span className="text-xs font-semibold text-text-main">
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-[11px] leading-tight text-text-muted">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tiêu đề */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="alert-title"
                className="text-xs font-semibold text-text-main"
              >
                Tiêu đề thông báo <span className="text-destructive">*</span>
              </label>
              <span className="text-[11px] text-text-muted">
                {title.length}/200
              </span>
            </div>
            <input
              id="alert-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
              disabled={sendAlertMutation.isPending}
              placeholder="VD: Bảo trì hệ thống máy chủ định kỳ..."
              maxLength={200}
              className={cn(
                "w-full rounded-xl border bg-bg px-3.5 py-2 text-xs text-text-main transition-colors placeholder:text-text-muted/60 focus:ring-1 focus:outline-none",
                titleError
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border focus:border-primary focus:ring-primary/20",
              )}
            />
            {titleError && (
              <p className="flex items-center gap-1 text-[11px] text-destructive">
                <AlertCircle className="size-3 shrink-0" />
                {titleError}
              </p>
            )}
          </div>

          {/* Nội dung */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="alert-body"
                className="text-xs font-semibold text-text-main"
              >
                Nội dung chi tiết <span className="text-destructive">*</span>
              </label>
              <span className="text-[11px] text-text-muted">
                {body.length}/2000
              </span>
            </div>
            <textarea
              id="alert-body"
              rows={4}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (bodyError) setBodyError(null);
              }}
              disabled={sendAlertMutation.isPending}
              placeholder="Nhập chi tiết nội dung cần thông báo tới người dùng..."
              maxLength={2000}
              className={cn(
                "w-full resize-none rounded-xl border bg-bg px-3.5 py-2.5 text-xs text-text-main transition-colors placeholder:text-text-muted/60 focus:ring-1 focus:outline-none",
                bodyError
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border focus:border-primary focus:ring-primary/20",
              )}
            />
            {bodyError && (
              <p className="flex items-center gap-1 text-[11px] text-destructive">
                <AlertCircle className="size-3 shrink-0" />
                {bodyError}
              </p>
            )}
          </div>

          {/* Live Preview Toast (Mô phỏng Bottom-Right Toast) */}
          <div className="space-y-2 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-text-muted uppercase">
                Xem trước
              </span>
            </div>
            <div className="rounded-xl border border-border/80 bg-surface p-3.5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Megaphone className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-semibold text-text-main">
                    {title.trim() || "Tiêu đề thông báo..."}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">
                    {body.trim() ||
                      "Nội dung thông báo sẽ hiển thị trực tiếp dạng pop-up ở góc dưới bên phải màn hình của người dùng..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="flex-row justify-end gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={sendAlertMutation.isPending}
              className="text-xs!"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              icon={Send}
              isLoading={sendAlertMutation.isPending}
              className="text-xs!"
            >
              Phát thông báo ngay
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AdminSendNotificationModal;
