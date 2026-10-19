import { useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  Edit3,
  Eye,
  EyeOff,
  KeyRound,
  ShieldAlert,
  Trash2,
  User,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import Button from "@/components/Button";

import { useAuthStore } from "@/stores/authStore";
import { getApiErrorMessage } from "@/api/errorHandler";
import { toast } from "@/components/ui/toast";
import type { UpdateProfileRequest } from "@/types/account";
import {
  useChangePassword,
  useGetMe,
  useUpdateAccount,
} from "@/hooks/queries/useAccount";
import { useUploadImage } from "@/hooks/queries/useMedia";

type TabKey = "profile" | "security" | "delete";

const ROLE_LABELS: Record<string, string> = {
  Candidate: "Ứng viên",
  Recruiter: "Nhà tuyển dụng",
  Admin: "Quản trị viên",
};

export default function UserProfile() {
  const authUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const { data: serverAccount, isLoading: isFetchingAccount } = useGetMe();
  const { mutateAsync: updateAccount, isPending: isSavingProfile } =
    useUpdateAccount();
  const { mutateAsync: changePassword, isPending: isChangingPw } =
    useChangePassword();
  const { mutateAsync: uploadImage, isPending: isUploadingAvatar } =
    useUploadImage();

  const account = useMemo(
    () => serverAccount ?? authUser ?? null,
    [serverAccount, authUser],
  );
  const currentAvatar = account?.avatarUrl ?? null;

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const [pendingAvatarFileId, setPendingAvatarFileId] = useState<string | null>(
    null,
  );

  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeAllSessions, setRevokeAllSessions] = useState(true);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwMessage, setPwMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleStartEdit = () => {
    if (!account) return;
    setFullName(account.fullName);
    setPhone(account.phone ?? "");
    setPendingAvatarUrl(currentAvatar);
    setPendingAvatarFileId(null);
    setProfileMessage(null);
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setProfileMessage(null);
    setPendingAvatarFileId(null);
    setIsEditingProfile(false);
  };

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileMessage(null);

    try {
      const mediaData = await uploadImage(file);
      setPendingAvatarUrl(mediaData.fileUrl);
      setPendingAvatarFileId(mediaData.id);

      if (!isEditingProfile && account) {
        setFullName(account.fullName);
        setPhone(account.phone ?? "");
        setIsEditingProfile(true);
      }
    } catch (err: unknown) {
      setProfileMessage({
        type: "error",
        text: getApiErrorMessage(err, "Tải ảnh đại diện thất bại."),
      });
    } finally {
      e.target.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    setProfileMessage(null);

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setProfileMessage({
        type: "error",
        text: "Họ và tên phải có độ dài từ 2 đến 100 ký tự.",
      });
      return;
    }

    const normalizedPhone = phone.trim() === "" ? null : phone.trim();

    const payload: UpdateProfileRequest = {};
    if (trimmedName !== account.fullName) payload.fullName = trimmedName;
    if (normalizedPhone !== (account.phone ?? null))
      payload.phone = normalizedPhone;

    if (pendingAvatarFileId) {
      payload.avatarFileId = pendingAvatarFileId;
    } else if (pendingAvatarUrl === null && currentAvatar !== null) {
      payload.avatarFileId = null;
    }

    if (Object.keys(payload).length === 0) {
      setIsEditingProfile(false);
      return;
    }

    try {
      await updateAccount(payload);
      setIsEditingProfile(false);
      setPendingAvatarFileId(null);
      toast.add({
        type: "success",
        description: "Cập nhật thông tin thành công",
      });
    } catch (err: unknown) {
      setProfileMessage({
        type: "error",
        text: getApiErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại."),
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);

    if (!currentPassword) {
      setPwMessage({
        type: "error",
        text: "Vui lòng nhập mật khẩu hiện tại.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPwMessage({
        type: "error",
        text: "Mật khẩu mới phải có tối thiểu 8 ký tự.",
      });
      return;
    }

    if (newPassword === currentPassword) {
      setPwMessage({
        type: "error",
        text: "Mật khẩu mới không được trùng với mật khẩu hiện tại.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwMessage({
        type: "error",
        text: "Xác nhận mật khẩu mới không khớp.",
      });
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
        revokeAllSessions,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.add({
        type: "success",
        description: "Đổi mật khẩu thành công",
      });
    } catch (err: unknown) {
      setPwMessage({
        type: "error",
        text: getApiErrorMessage(err, "Mật khẩu hiện tại không chính xác."),
      });
    }
  };

  if (isFetchingAccount && !account) {
    return (
      <div className="flex min-h-100 w-full items-center justify-center">
        <p className="text-sm text-text-muted">
          Đang tải thông tin tài khoản...
        </p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex min-h-100 w-full items-center justify-center">
        <p className="text-sm text-text-muted">
          Không tìm thấy thông tin tài khoản.
        </p>
      </div>
    );
  }

  const displayAvatar = isEditingProfile ? pendingAvatarUrl : currentAvatar;
  const initials = account.fullName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="text-2xl font-bold text-text-main">Cài đặt tài khoản</h1>

      <div className="flex flex-col rounded-3xl border border-border bg-white md:flex-row">
        <aside className="w-full shrink-0 border-b border-border p-4 md:w-60 md:border-r md:border-b-0 md:p-6">
          <nav className="flex flex-row gap-2 overflow-x-auto md:flex-col">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2.5 text-left text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === "profile"
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-bg hover:text-text-main"
              }`}
            >
              <User className="size-4 shrink-0" />
              Thông tin
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2.5 text-left text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === "security"
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-bg hover:text-text-main"
              }`}
            >
              <KeyRound className="size-4 shrink-0" />
              Bảo mật
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("delete")}
              className={`flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2.5 text-left text-xs font-semibold whitespace-nowrap transition-colors md:mt-4 ${
                activeTab === "delete"
                  ? "bg-rose-50 text-rose-600"
                  : "text-rose-500 hover:bg-rose-50/60"
              }`}
            >
              <Trash2 className="size-4 shrink-0" />
              Xóa tài khoản
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-5 md:p-8">
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-main">
                  Hồ sơ của tôi
                </h2>
              </div>

              {profileMessage && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-xs font-medium ${
                    profileMessage.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-600"
                  }`}
                >
                  {profileMessage.text}
                </div>
              )}

              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border p-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="relative size-18 shrink-0">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt={account.fullName}
                        className="size-full rounded-full border border-border object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                        {initials || "U"}
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      title="Tải ảnh đại diện mới"
                      className="absolute right-0 bottom-0 flex size-7 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-text-main transition-colors hover:bg-bg disabled:opacity-50"
                    >
                      <Camera className="size-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-bold text-text-main">
                      {account.fullName}
                    </h3>
                    <p className="text-xs text-text-muted">{account.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  {isEditingProfile && pendingAvatarUrl && (
                    <Button
                      variant="secondary"
                      icon={X}
                      iconSize={14}
                      onClick={() => {
                        setPendingAvatarUrl(null);
                        setPendingAvatarFileId(null);
                      }}
                      className="h-9! rounded-full! px-3! py-1.5! text-xs!"
                    >
                      Gỡ ảnh
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    icon={Camera}
                    iconSize={14}
                    isLoading={isUploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9! rounded-full! px-3.5! py-1.5! text-xs!"
                  >
                    Đổi ảnh
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-6 rounded-2xl border border-border p-5">
                <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                  <h3 className="text-base font-bold text-text-main">
                    Thông tin cá nhân
                  </h3>

                  {!isEditingProfile ? (
                    <Button
                      variant="secondary"
                      icon={Edit3}
                      iconSize={14}
                      onClick={handleStartEdit}
                      className="h-9! rounded-full! px-3.5! py-1.5! text-xs!"
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        icon={X}
                        iconSize={14}
                        onClick={handleCancelEdit}
                        className="h-9! rounded-full! px-3.5! py-1.5! text-xs!"
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        icon={Check}
                        iconSize={14}
                        isLoading={isSavingProfile}
                        className="h-9! rounded-full! px-4! py-1.5! text-xs!"
                      >
                        Lưu thay đổi
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-muted">
                      Họ và tên
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên (2 - 100 ký tự)"
                        className="rounded-xl border border-border bg-white px-3.5 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-text-main">
                        {account.fullName}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-muted">
                      Số điện thoại
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ví dụ: +84901234567 (để trống để xóa)"
                        className="rounded-xl border border-border bg-white px-3.5 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-text-main">
                        {account.phone || "Chưa cập nhật"}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-text-muted">
                      Địa chỉ Email
                    </span>
                    <p className="text-sm font-semibold text-text-main">
                      {account.email}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-text-muted">
                      Vai trò tài khoản
                    </span>
                    <p className="text-sm font-semibold text-text-main">
                      {account.roles.map((r) => ROLE_LABELS[r] || r).join(", ")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-text-muted">
                      Trạng thái
                    </span>
                    <p className="text-sm font-semibold text-text-main">
                      {account.status}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-text-muted">
                      Cập nhật lần cuối
                    </span>
                    <p className="text-sm font-semibold text-text-main">
                      {account.updatedAt
                        ? dayjs(account.updatedAt).format("DD/MM/YYYY HH:mm")
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form
              onSubmit={handlePasswordSubmit}
              className="flex max-w-xl flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-text-main">
                  Đổi mật khẩu
                </h2>
                <p className="text-xs text-text-muted">
                  Mật khẩu mới cần tối thiểu 8 ký tự và không được trùng với mật
                  khẩu hiện tại.
                </p>
              </div>

              {pwMessage && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-xs font-medium ${
                    pwMessage.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-600"
                  }`}
                >
                  {pwMessage.text}
                </div>
              )}

              <div className="flex flex-col gap-4 rounded-2xl border border-border p-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full rounded-xl border border-border bg-white py-2 pr-10 pl-3.5 text-sm text-text-main focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw((v) => !v)}
                      className="absolute right-3 cursor-pointer text-text-muted hover:text-text-main"
                    >
                      {showCurrentPw ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    Mật khẩu mới
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 8 ký tự"
                      className="w-full rounded-xl border border-border bg-white py-2 pr-10 pl-3.5 text-sm text-text-main focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      className="absolute right-3 cursor-pointer text-text-muted hover:text-text-main"
                    >
                      {showNewPw ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
                  />
                </div>

                <label className="mt-1 flex cursor-pointer items-center gap-2.5 text-xs text-text-main">
                  <input
                    type="checkbox"
                    checked={revokeAllSessions}
                    onChange={(e) => setRevokeAllSessions(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  Đăng xuất khỏi tất cả các thiết bị khác sau khi đổi mật khẩu
                </label>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isChangingPw}
                    className="h-9! rounded-xl! px-5! py-2! text-xs!"
                  >
                    Cập nhật mật khẩu
                  </Button>
                </div>
              </div>
            </form>
          )}

          {activeTab === "delete" && (
            <div className="flex max-w-xl flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-rose-600">
                  Xóa tài khoản
                </h2>
                <p className="text-xs text-text-muted">
                  Quản lý việc đóng vĩnh viễn tài khoản của bạn trên hệ thống.
                </p>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 size-5 shrink-0 text-rose-600" />
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold text-text-main">
                      Hành động này không thể hoàn tác
                    </h3>
                    <p className="text-xs leading-relaxed text-text-muted">
                      Khi bạn xóa tài khoản, toàn bộ thông tin hồ sơ, danh sách
                      CV và lịch sử ứng tuyển gắn với tài khoản{" "}
                      <span className="font-semibold text-text-main">
                        {account.email}
                      </span>{" "}
                      sẽ bị gỡ bỏ.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    icon={Trash2}
                    iconSize={14}
                    onClick={() => {}}
                    className="h-9! rounded-xl! bg-rose-600! px-4! py-2! text-xs! text-white! hover:bg-rose-700!"
                  >
                    Xóa tài khoản vĩnh viễn
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
