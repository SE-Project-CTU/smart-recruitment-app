import { useState } from "react";
import { Building2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/common/Button";
import type { GoogleAuthRole } from "@/types/auth";
import { cn } from "@/lib/utils";

interface GoogleRoleSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (role: GoogleAuthRole) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
}

const ROLE_OPTIONS: {
  value: GoogleAuthRole;
  title: string;
  description: string;
  icon: typeof User;
}[] = [
  {
    value: "Candidate",
    title: "Ứng viên",
    description: "Tìm việc làm, tạo hồ sơ CV và theo dõi trạng thái ứng tuyển.",
    icon: User,
  },
  {
    value: "Recruiter",
    title: "Nhà tuyển dụng",
    description:
      "Đăng tin tuyển dụng, quản lý doanh nghiệp và xét duyệt hồ sơ ứng viên.",
    icon: Building2,
  },
];

export function GoogleRoleSelectModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  errorMessage = null,
}: GoogleRoleSelectModalProps) {
  const [selectedRole, setSelectedRole] = useState<GoogleAuthRole | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset lựa chọn mỗi lần mở modal cho tài khoản mới
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelectedRole(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isLoading) return;
        if (!next) setSelectedRole(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg" showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-main">
            Chọn vai trò tham gia
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-text-muted md:text-sm">
            Chọn vai trò phù hợp để hoàn tất đăng ký tài khoản SmartHire với
            Google.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ROLE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedRole === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={isLoading}
                onClick={() => setSelectedRole(option.value)}
                className={cn(
                  "relative flex cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all sm:flex-col sm:items-center sm:gap-3 sm:p-5 sm:text-center",
                  isSelected
                    ? "border-primary bg-bg-white-blue/60"
                    : "border-border bg-white hover:border-primary/40 hover:bg-bg",
                )}
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors sm:size-12",
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-bg-white-blue text-secondary-dark",
                  )}
                >
                  <Icon className="size-5 sm:size-6" />
                </div>

                <div className="min-w-0 flex-1 sm:w-full">
                  <span className="block text-sm font-semibold text-text-main">
                    {option.title}
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {errorMessage ? (
          <p className="text-xs font-medium text-status-error">
            {errorMessage}
          </p>
        ) : null}

        <DialogFooter className="flex-row justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!selectedRole}
            isLoading={isLoading}
            onClick={() => selectedRole && void onConfirm(selectedRole)}
          >
            Hoàn tất đăng nhập
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GoogleRoleSelectModal;
