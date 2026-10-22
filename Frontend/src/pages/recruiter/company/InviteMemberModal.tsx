import { useState } from "react";
import { UserPlus, X, Send } from "lucide-react";
import Button from "@/components/Button";
import { companyService } from "@/services/companyService";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  onSuccess: () => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  onSuccess,
}: InviteMemberModalProps) {
  const [inviteeId, setInviteeId] = useState("");
  const [expireDays, setExpireDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteeId.trim()) {
      setError("Vui lòng nhập ID hoặc Email tài khoản Nhà tuyển dụng");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const expiresAt = new Date(
        Date.now() + expireDays * 24 * 60 * 60 * 1000,
      ).toISOString();

      const result = await companyService.inviteMember(companyId, {
        inviteeId: inviteeId.trim(),
        expiresAt,
      });

      setSuccessMsg(result.message || "Đã gửi lời mời thành công!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể gửi lời mời. Vui lòng kiểm tra lại.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-main">
                Mời nhân sự tuyển dụng
              </h2>
              <p className="text-xs text-text-muted truncate max-w-[240px]">
                {companyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-text-muted hover:bg-slate-100 hover:text-text-main transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5">
              Tài khoản Recruiter (ID hoặc Email) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={inviteeId}
              onChange={(e) => setInviteeId(e.target.value)}
              placeholder="Nhập UUID hoặc email chuyên viên..."
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              required
            />
            <p className="mt-1 text-[11px] text-text-muted">
              Người được mời phải có tài khoản vai trò Nhà tuyển dụng (Recruiter) trong hệ thống.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5">
              Thời hạn hiệu lực của lời mời
            </label>
            <select
              value={expireDays}
              onChange={(e) => setExpireDays(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
            >
              <option value={3}>3 ngày</option>
              <option value={7}>7 ngày (Mặc định)</option>
              <option value={14}>14 ngày</option>
              <option value={30}>30 ngày</option>
            </select>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Send}
              isLoading={isLoading}
            >
              Gửi lời mời
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
