import { useState } from "react";
import { UserPlus, X, Send, AlertCircle, Info } from "lucide-react";
import Button from "@/components/Button";
import { getApiErrorMessage } from "@/api/errorHandler";
import { useInviteMember } from "@/hooks/queries/useCompany";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  onSuccess: () => void;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function InviteMemberModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  onSuccess,
}: InviteMemberModalProps) {
  const [inviteeId, setInviteeId] = useState("");
  const [expireDays, setExpireDays] = useState(7);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { mutateAsync: inviteMember, isPending } = useInviteMember();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = inviteeId.trim();

    if (!cleanId) {
      setError("Vui lòng nhập User ID của tài khoản Nhà tuyển dụng");
      return;
    }

    if (!UUID_REGEX.test(cleanId)) {
      setError(
        "Định dạng không hợp lệ! Backend yêu cầu mã UUID của tài khoản (Ví dụ: e2c5a5c7-3658-442d-87c1-cf8ff34d2d8b), không dùng địa chỉ email.",
      );
      return;
    }

    try {
      setError(null);
      const expiresAt = new Date(
        Date.now() + expireDays * 24 * 60 * 60 * 1000,
      ).toISOString();

      await inviteMember({
        companyId,
        payload: {
          inviteeId: cleanId,
          expiresAt,
        },
      });

      setSuccessMsg("Đã gửi lời mời tham gia doanh nghiệp thành công!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          "Gửi lời mời thất bại. Tài khoản phải có vai trò Recruiter và chưa gia nhập công ty.",
        ),
      );
    }
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-slate-100 hover:text-text-main"
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

        {successMsg && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-main">
              Mã User ID của Recruiter <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={inviteeId}
              onChange={(e) => {
                setInviteeId(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. 7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a"
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 font-mono text-sm text-text-main outline-none placeholder:font-sans placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
              required
            />
            <div className="mt-2 flex items-start gap-1.5 text-[11px] text-text-muted">
              <Info className="mt-0.5 size-3.5 shrink-0 text-sky-600" />
              <span>
                Backend API chỉ nhận mã <strong>UUID</strong> của tài khoản đã
                đăng ký vai trò <strong>Nhà tuyển dụng (Recruiter)</strong>.
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-main">
              Thời hạn hiệu lực của lời mời
            </label>
            <select
              value={expireDays}
              onChange={(e) => setExpireDays(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            >
              <option value={3}>3 ngày</option>
              <option value={7}>7 ngày (Mặc định)</option>
              <option value={14}>14 ngày</option>
              <option value={30}>30 ngày</option>
            </select>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button variant="secondary" onClick={onClose} disabled={isPending}>
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
