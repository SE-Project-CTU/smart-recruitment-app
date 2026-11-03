import { useNavigate } from "react-router-dom";
import { LogIn, UserCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Button from "@/components/common/Button";
import { PATHS } from "@/constants/paths";

export interface AuthPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionText?: string;
}

export function AuthPromptModal({
  open,
  onOpenChange,
  actionText = "thực hiện hành động này",
}: AuthPromptModalProps) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onOpenChange(false);
    navigate(PATHS.SIGN_IN);
  };

  const handleSignUp = () => {
    onOpenChange(false);
    navigate(PATHS.SIGN_UP);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LogIn className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-text-main">
                Yêu cầu đăng nhập
              </DialogTitle>
              <DialogDescription className="text-xs text-text-muted">
                Bạn cần đăng nhập tài khoản SmartHire để {actionText}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="mt-2 text-xs leading-relaxed text-text-muted">
          Đăng nhập giúp bạn lưu trữ công ty quan tâm, theo dõi tin tuyển dụng
          mới nhất hoặc gửi yêu cầu gia nhập vào đội ngũ nhân sự.
        </p>

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="text-xs px-3.5 py-2"
            onClick={() => onOpenChange(false)}
          >
            Để sau
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-xs px-3.5 py-2"
            onClick={handleSignUp}
          >
            Đăng ký tài khoản
          </Button>
          <Button
            type="button"
            variant="primary"
            className="text-xs px-3.5 py-2 flex items-center gap-1.5"
            onClick={handleSignIn}
          >
            <UserCheck className="size-4" />
            Đăng nhập ngay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthPromptModal;
