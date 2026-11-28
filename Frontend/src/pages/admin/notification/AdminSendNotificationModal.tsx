import { useState } from "react";
import {
  Globe,
  UserCheck,
  Building2,
  AlertCircle,
  AlertTriangle,
  Megaphone,
  Info,
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
import type {
  AdminSystemAlertTarget,
  AdminSystemAlertLevel,
} from "@/types/admin";
import { cn } from "cn";

interface AdminSendNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const TARGET_OPTIONS: Array<{
  value: AdminSystemAlertTarget;
  label: string;
  shortLabel: string;
  icon: typeof Globe;
}> = [
  {
    value: "SystemAll",
    label: "Toàn bộ hệ thống",
    shortLabel: "Toàn hệ thống",
    icon: Globe,
  },
  {
    value: "Candidate",
    label: "Ứng viên",
    shortLabel: "Ứng viên",
    icon: UserCheck,
  },
  {
    value: "Recruiter",
    label: "Nhà tuyển dụng",
    shortLabel: "Tuyển dụng",
    icon: Building2,
  },
];

const LEVEL_OPTIONS: Array<{
  value: AdminSystemAlertLevel;
  label: string;
  shortLabel: string;
  icon: typeof Info;
}> = [
  {
    value: "general",
    label: "Chung",
    shortLabel: "Chung",
    icon: Megaphone,
  },
  {
    value: "info",
    label: "Thông tin",
    shortLabel: "Thông tin",
    icon: Info,
  },
  {
    value: "warning",
    label: "Cảnh báo",
    shortLabel: "Cảnh báo",
    icon: AlertTriangle,
  },
  {
    value: "error",
    label: "Nguy cấp",
    shortLabel: "Nguy cấp",
    icon: AlertCircle,
  },
];

export function AdminSendNotificationModal({
  open,
  onOpenChange,
  onSuccess,
}: AdminSendNotificationModalProps) {
  const [target, setTarget] = useState<AdminSystemAlertTarget>("SystemAll");
  const [level, setLevel] = useState<AdminSystemAlertLevel>("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);

  const sendAlertMutation = useSendSystemAlert();

  const targetIndex = Math.max(
    0,
    TARGET_OPTIONS.findIndex((o) => o.value === target),
  );
  const levelIndex = Math.max(
    0,
    LEVEL_OPTIONS.findIndex((o) => o.value === level),
  );

  const handleClose = () => {
    if (sendAlertMutation.isPending) return;
    onOpenChange(false);
  };

  const handleReset = () => {
    setTitle("");
    setBody("");
    setTarget("SystemAll");
    setLevel("general");
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
        alertLevel: level,
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

  const activeLevelConfig =
    LEVEL_OPTIONS.find((opt) => opt.value === level) ?? LEVEL_OPTIONS[0];
  const LevelIcon = activeLevelConfig.icon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-sm gap-0 overflow-x-hidden overflow-y-auto rounded-2xl border border-border/80 bg-surface p-0 sm:w-full sm:max-w-md md:max-w-lg"
        showCloseButton={!sendAlertMutation.isPending}
      >
        {/* Header */}
        <div className="border-b border-border/60 bg-bg-white-blue/50 px-3.5 py-3 sm:p-5">
          <DialogHeader className="gap-0.5 pr-6 text-left sm:gap-1.5">
            <div>
              <DialogTitle className="text-sm font-semibold text-text-main sm:text-base">
                Phát thông báo hệ thống
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[11px] text-text-muted sm:text-xs">
                Gửi thông báo tới người dùng và lưu vào lịch sử thông báo
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-full min-w-0 space-y-3 overflow-hidden p-3.5 sm:space-y-4 sm:p-5"
        >
          {/* Đối tượng nhận */}
          <div className="w-full min-w-0 space-y-1 sm:space-y-1.5">
            <label className="block text-xs font-semibold text-text-main">
              Đối tượng <span className="text-destructive">*</span>
            </label>
            <div className="relative grid w-full grid-cols-3 divide-x divide-border overflow-hidden rounded-xl border border-border/80 bg-surface">
              {/* Nền xanh trượt mượt mà 100% bằng CSS transition */}
              <div
                className="pointer-events-none absolute inset-y-0 w-1/3 bg-status-active transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(${targetIndex * 100}%)`,
                }}
              />

              {TARGET_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = target === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTarget(opt.value)}
                    disabled={sendAlertMutation.isPending}
                    className="relative z-10 flex w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-none px-1 py-2 text-center focus:outline-none sm:gap-1.5 sm:px-2 sm:py-3"
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors duration-200 sm:size-5",
                        isSelected
                          ? "text-text-main"
                          : "text-text-muted hover:text-text-main",
                      )}
                    />
                    <span
                      className={cn(
                        "w-full truncate px-0.5 text-center text-[10px] leading-tight transition-colors duration-200 sm:text-xs",
                        isSelected
                          ? "text-text-main"
                          : "text-text-muted hover:text-text-main",
                      )}
                    >
                      <span className="hidden sm:inline">{opt.label}</span>
                      <span className="sm:hidden">{opt.shortLabel}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loại thông báo */}
          <div className="w-full min-w-0 space-y-1 sm:space-y-1.5">
            <label className="block text-xs font-semibold text-text-main">
              Loại thông báo <span className="text-destructive">*</span>
            </label>
            <div className="relative grid w-full min-w-0 grid-cols-4 gap-1 rounded-xl bg-bg-white-blue p-1">
              {/* Nền xanh trượt mượt mà 100% theo grid 4 cột */}
              <div
                className="pointer-events-none absolute inset-y-1 rounded-lg bg-status-active shadow-2xs transition-transform duration-300 ease-out"
                style={{
                  left: "4px",
                  width: "calc((100% - 20px) / 4)",
                  transform: `translateX(calc(${levelIndex * 100}% + ${levelIndex * 4}px))`,
                }}
              />

              {LEVEL_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = level === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLevel(opt.value)}
                    disabled={sendAlertMutation.isPending}
                    className="relative z-10 flex w-full min-w-0 cursor-pointer items-center justify-center gap-1 rounded-lg px-0.5 py-1.5 text-[10px] focus:outline-none sm:gap-1.5 sm:px-2 sm:text-xs"
                  >
                    <Icon
                      className={cn(
                        "size-3 shrink-0 transition-colors duration-200 sm:size-3.5",
                        isSelected ? "text-text-main" : "text-text-muted",
                      )}
                    />
                    <span
                      className={cn(
                        "truncate transition-colors duration-200",
                        isSelected ? "text-text-main" : "text-text-muted",
                      )}
                    >
                      <span className="hidden sm:inline">{opt.label}</span>
                      <span className="sm:hidden">{opt.shortLabel}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tiêu đề */}
          <div className="w-full min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="alert-title"
                className="text-xs font-semibold text-text-main"
              >
                Tiêu đề <span className="text-destructive">*</span>
              </label>
              <span className="text-[10px] text-text-muted sm:text-[11px]">
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
                "w-full rounded-xl border bg-bg px-3 py-1.5 text-xs text-text-main transition-colors placeholder:text-text-muted/60 focus:ring-1 focus:outline-none sm:px-3.5 sm:py-2",
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
          <div className="w-full min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="alert-body"
                className="text-xs font-semibold text-text-main"
              >
                Nội dung chi tiết <span className="text-destructive">*</span>
              </label>
              <span className="text-[10px] text-text-muted sm:text-[11px]">
                {body.length}/2000
              </span>
            </div>
            <textarea
              id="alert-body"
              rows={2}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (bodyError) setBodyError(null);
              }}
              disabled={sendAlertMutation.isPending}
              placeholder="Nhập chi tiết nội dung cần thông báo tới người dùng..."
              maxLength={2000}
              className={cn(
                "sm:rows-3 w-full resize-none rounded-xl border bg-bg px-3 py-1.5 text-xs text-text-main transition-colors placeholder:text-text-muted/60 focus:ring-1 focus:outline-none sm:px-3.5 sm:py-2",
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
          <div className="w-full min-w-0 space-y-1 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-text-muted uppercase sm:text-[11px]">
                Xem trước giao diện
              </span>
              <span className="text-[10px] font-semibold text-secondary-dark sm:text-[11px]">
                {activeLevelConfig.label}
              </span>
            </div>
            <div className="w-full min-w-0 overflow-hidden rounded-xl border border-border/80 bg-surface p-2.5 shadow-xs sm:p-3.5">
              <div className="flex w-full min-w-0 items-start gap-2 sm:gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-bg-white-blue text-secondary-dark sm:size-7">
                  <LevelIcon className="size-3 sm:size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-text-main sm:text-xs">
                    {title.trim() || "Tiêu đề thông báo..."}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed wrap-break-word text-text-muted sm:text-xs">
                    {body.trim() ||
                      "Nội dung thông báo sẽ hiển thị trực tiếp dạng pop-up ở góc dưới bên phải và lưu vào chuông thông báo của người dùng..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="grid w-full grid-cols-2 gap-2 pt-1 sm:flex sm:justify-end sm:gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={sendAlertMutation.isPending}
              className="w-full text-xs! sm:w-auto"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              icon={Send}
              isLoading={sendAlertMutation.isPending}
              className="w-full text-xs! sm:w-auto"
            >
              <span className="sm:hidden">Phát thông báo</span>
              <span className="hidden sm:inline">Phát thông báo ngay</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AdminSendNotificationModal;
