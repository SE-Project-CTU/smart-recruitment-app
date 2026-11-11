import { useState } from "react";
import { Building2, Check, User } from "lucide-react";
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
}: GoogleRoleSelectModalProps) {
  const [selectedRole, setSelectedRole] = useState<GoogleAuthRole>("Candidate");

  return (
    <Dialog open={open} onOpenChange={(next) => !isLoading && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-main">
            Chọn vai trò tham gia
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-text-muted md:text-sm">
            Đây là lần đầu bạn đăng nhập bằng tài khoản Google này. Vui lòng chọn
            vai trò phù hợp để hoàn tất tạo tài khoản SmartHire.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
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
                  "flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 text-left transition-all",
                  isSelected
                    ? "border-primary bg-bg-white-blue"
                    : "border-border bg-white hover:border-primary/40 hover:bg-bg",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-bg text-text-muted",
                  )}
                >
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-text-main">
                      {option.title}
                    </span>
                    {isSelected && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="size-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter>
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
            isLoading={isLoading}
            onClick={() => void onConfirm(selectedRole)}
          >
            Hoàn tất đăng nhập
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GoogleRoleSelectModal;

