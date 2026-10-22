import { useState } from "react";
import { UserPlus, X, Send, AlertCircle, Info, Mail, ChevronDown } from "lucide-react";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import Button from "@/components/Button";
import { toast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/api/errorHandler";
import { useInviteMember } from "@/hooks/queries/useCompany";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  onSuccess: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EXPIRE_DAYS_OPTIONS = [
  { value: "3", label: "3 ngày" },
  { value: "7", label: "7 ngày (Mặc định)" },
  { value: "14", label: "14 ngày" },
  { value: "30", label: "30 ngày" },
];

export function InviteMemberModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  onSuccess,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [expireDays, setExpireDays] = useState("7");
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: inviteMember, isPending } = useInviteMember();

  if (!isOpen) return null;

  const handleClose = () => {
    if (isPending) return;
    setError(null);
    setEmail("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Vui lòng nhập địa chỉ email của Nhà tuyển dụng.");
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError(
        "Địa chỉ email không đúng định dạng (ví dụ: recruiter@example.com).",
      );
      return;
    }

    try {
      setError(null);
      const expiresAt = new Date(
        Date.now() + Number(expireDays) * 24 * 60 * 60 * 1000,
      ).toISOString();

      await inviteMember({
        companyId,
        payload: {
          email: cleanEmail,
          expiresAt,
        },
      });

      toast.add({
        type: "success",
        title: "Gửi lời mời thành công",
        description: `Đã gửi lời mời tham gia công ty đến ${cleanEmail}.`,
      });

      setEmail("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = getApiErrorMessage(
        err,
        "Gửi lời mời thất bại. Tài khoản phải có vai trò Nhà tuyển dụng (Recruiter) và chưa gia nhập công ty.",
      );
      setError(message);
      toast.add({
        type: "destructive",
        title: "Gửi lời mời thất bại",
        description: message,
      });
    }
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-main">
                Mời nhân sự tuyển dụng
              </h2>
              <p className="max-w-60 truncate text-xs text-text-muted">
                {companyName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            type="button"
            disabled={isPending}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-slate-100 hover:text-text-main disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-main">
              Email Nhà tuyển dụng (Recruiter){" "}
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
                <Mail className="size-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="recruiter@example.com"
                className="w-full rounded-xl border border-border bg-bg py-2.5 pr-3.5 pl-10 text-sm text-text-main outline-none placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
                autoFocus
              />
            </div>
            <div className="mt-2 flex items-start gap-1.5 text-[11px] text-text-muted">
              <Info className="mt-0.5 size-3.5 shrink-0 text-sky-600" />
              <span>
                Hệ thống sẽ gửi thông báo và lời mời đến tài khoản này. Người
                nhận cần có tài khoản vai trò <strong>Nhà tuyển dụng </strong>.
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-main">
              Thời hạn hiệu lực của lời mời
            </label>
            <Select.Root
              items={EXPIRE_DAYS_OPTIONS}
              value={expireDays}
              onValueChange={(val) => {
                if (val) setExpireDays(val);
              }}
            >
              <Select.Trigger
                aria-label="Thời hạn hiệu lực của lời mời"
                className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none"
              >
                <Select.Value />
                <Select.Icon className="text-text-muted transition-transform duration-200 group-data-popup-open:rotate-180">
                  <ChevronDown className="size-4" />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Positioner alignItemWithTrigger={false} sideOffset={4}>
                  <Select.Popup className="z-50 w-(--anchor-width) min-w-48 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-md">
                    <Select.List>
                      {EXPIRE_DAYS_OPTIONS.map((opt) => (
                        <Select.Item
                          key={opt.value}
                          value={opt.value}
                          className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-text-main transition-colors hover:bg-bg data-highlighted:bg-bg data-[state=checked]:font-semibold data-[state=checked]:text-primary"
                        >
                          <Select.ItemText>{opt.label}</Select.ItemText>
                          <Select.ItemIndicator
                            animation="pop"
                            className="ml-2 text-xs text-primary"
                          >
                            ✓
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Send}
              isLoading={isPending}
            >
              Gửi lời mời
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
