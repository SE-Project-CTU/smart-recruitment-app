import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  Edit3,
  KeyRound,
  ShieldAlert,
  Trash2,
  User,
} from "lucide-react";
import { Eye, EyeOff } from "lucide";
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
import { useDeleteMedia, useUploadImage } from "@/hooks/queries/useMedia";
import { MorphIcon } from "morphicons/react";
import { UserAvatar } from "@/components/UserAvatar";

type TabKey = "profile" | "security" | "delete";

interface ProfileErrors {
  avatar?: string;
  fullName?: string;
  phone?: string;
  general?: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const ROLE_LABELS: Record<string, string> = {
  Candidate: "Ứng viên",
  Recruiter: "Nhà tuyển dụng",
  Admin: "Quản trị viên",
};

const COVER_IMAGE_URL = "https://picsum.photos/id/29/3000/800";

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
  const { mutateAsync: deleteMedia } = useDeleteMedia();

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
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ref dùng để cleanup orphan file nếu user upload rồi rời trang / unmount component
  const pendingFileIdRef = useRef<string | null>(null);
  useEffect(() => {
    pendingFileIdRef.current = pendingAvatarFileId;
  }, [pendingAvatarFileId]);

  useEffect(() => {
    return () => {
      if (pendingFileIdRef.current) {
        // Tự động dọn file tạm khi rời component mà chưa bấm Lưu
        deleteMedia(pendingFileIdRef.current).catch(() => {});
      }
    };
  }, [deleteMedia]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeAllSessions, setRevokeAllSessions] = useState(true);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwErrors, setPwErrors] = useState<PasswordErrors>({});

  // Hàm tiện ích hỗ trợ xóa file tạm ngầm mà không làm crash app nếu lỗi
  const safeDeleteMedia = async (fileId: string | null) => {
    if (!fileId) return;
    try {
      await deleteMedia(fileId);
    } catch (err) {
      console.warn("Không thể dọn file tạm:", err);
    }
  };

  const handleStartEdit = () => {
    if (!account) return;
    setFullName(account.fullName);
    setPhone(account.phone ?? "");
    setPendingAvatarUrl(currentAvatar);
    setPendingAvatarFileId(null);
    setProfileErrors({});
    setIsEditingProfile(true);
  };

  const handleCancelEdit = async () => {
    // Nếu có ảnh vừa upload lên mà bấm Hủy -> xóa ảnh đó khỏi server
    if (pendingAvatarFileId) {
      await safeDeleteMedia(pendingAvatarFileId);
    }
    setProfileErrors({});
    setPendingAvatarUrl(currentAvatar);
    setPendingAvatarFileId(null);
    setIsEditingProfile(false);
  };

  const handleRemovePendingAvatar = async () => {
    // Nếu vừa upload ảnh mới -> xóa ảnh đó khỏi server và khôi phục ảnh cũ ban đầu
    if (pendingAvatarFileId) {
      await safeDeleteMedia(pendingAvatarFileId);
    }
    setPendingAvatarUrl(currentAvatar);
    setPendingAvatarFileId(null);
  };

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileErrors((prev) => ({ ...prev, avatar: undefined }));

    try {
      const mediaData = await uploadImage(file);

      // Nếu trước đó đã upload 1 ảnh tạm khác, xóa ngay ảnh cũ đi để không bị rác CSDL/Cloudinary
      if (pendingAvatarFileId) {
        await safeDeleteMedia(pendingAvatarFileId);
      }

      setPendingAvatarUrl(mediaData.fileUrl);
      setPendingAvatarFileId(mediaData.id);

      if (!isEditingProfile && account) {
        setFullName(account.fullName);
        setPhone(account.phone ?? "");
        setIsEditingProfile(true);
      }
    } catch (err: unknown) {
      setProfileErrors((prev) => ({
        ...prev,
        avatar: getApiErrorMessage(err, "Tải ảnh đại diện thất bại."),
      }));
    } finally {
      e.target.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    const newErrors: ProfileErrors = {};
    const trimmedName = fullName.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      newErrors.fullName = "Họ và tên phải có độ dài từ 2 đến 100 ký tự.";
    }

    if (Object.keys(newErrors).length > 0) {
      setProfileErrors(newErrors);
      return;
    }

    setProfileErrors({});
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
      // Gán null cho ref để khi unmount không kích hoạt deleteMedia ảnh vừa lưu thành công
      pendingFileIdRef.current = null;
      setPendingAvatarFileId(null);
      setIsEditingProfile(false);

      toast.add({
        type: "success",
        description: "Cập nhật thông tin thành công",
      });
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.");
      if (msg.toLowerCase().includes("điện thoại")) {
        setProfileErrors({ phone: msg });
      } else if (msg.toLowerCase().includes("tên")) {
        setProfileErrors({ fullName: msg });
      } else {
        setProfileErrors({ general: msg });
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: PasswordErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";
    }

    if (newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu mới phải có tối thiểu 8 ký tự.";
    } else if (newPassword === currentPassword) {
      newErrors.newPassword =
        "Mật khẩu mới không được trùng với mật khẩu hiện tại.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới.";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu mới không khớp.";
    }

    if (Object.keys(newErrors).length > 0) {
      setPwErrors(newErrors);
      return;
    }

    setPwErrors({});

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
      const msg = getApiErrorMessage(err, "Mật khẩu hiện tại không chính xác.");
      if (msg.toLowerCase().includes("hiện tại")) {
        setPwErrors({ currentPassword: msg });
      } else if (msg.toLowerCase().includes("mật khẩu mới")) {
        setPwErrors({ newPassword: msg });
      } else {
        setPwErrors({ general: msg });
      }
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

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="text-2xl font-bold text-text-main">Cài đặt tài khoản</h1>

      <div className="flex flex-col rounded-3xl border border-border bg-white md:flex-row">
        <aside className="w-full shrink-0 rounded-l-3xl border-b border-border p-4 md:w-60 md:border-r md:border-b-0 md:p-6">
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
                  ? "bg-rose-50 text-status-error"
                  : "text-rose-500 hover:bg-rose-50/60"
              }`}
            >
              <Trash2 className="size-4 shrink-0" />
              Xóa tài khoản
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-5">
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
              <div className="overflow-hidden rounded-2xl border border-border bg-white">
                <div className="relative h-50 w-full bg-bg sm:h-70">
                  <img
                    src={COVER_IMAGE_URL}
                    alt="Cover"
                    className="size-full object-cover"
                  />
                </div>

                <div className="px-5 pb-4">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <div className="relative -mt-12 size-36 shrink-0 rounded-full border-4 border-white bg-white shadow-sm">
                        <UserAvatar
                          src={displayAvatar || ""}
                          name={account.fullName}
                          className="size-full! rounded-full!"
                        />

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
                          className="absolute right-0 bottom-0 flex size-7 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-text-main shadow-xs transition-colors hover:bg-bg disabled:opacity-50"
                        >
                          <Camera className="size-3.5" />
                        </button>
                      </div>

                      <div className="flex-col gap-0.5 pb-1 text-center md:text-left">
                        <h3 className="text-center text-lg font-bold text-text-main md:text-left">
                          {account.fullName}
                        </h3>
                        <p className="text-center text-xs text-text-muted md:text-left">
                          {account.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-center gap-2 self-start sm:self-end sm:pb-1 md:w-fit md:justify-end">
                      {isEditingProfile &&
                        pendingAvatarUrl !== currentAvatar && (
                          <Button
                            variant="secondary"
                            onClick={handleRemovePendingAvatar}
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

                  <div className="mt-1 min-h-4">
                    {profileErrors.avatar && (
                      <p className="text-xs font-medium text-status-error">
                        {profileErrors.avatar}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-border p-5">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-text-main">
                      Thông tin cá nhân
                    </h3>
                    <div className="min-h-4">
                      {profileErrors.general && (
                        <p className="text-xs font-medium text-status-error">
                          {profileErrors.general}
                        </p>
                      )}
                    </div>
                  </div>

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

                <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-text-muted">
                      Họ và tên
                    </label>
                    {isEditingProfile ? (
                      <>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (profileErrors.fullName) {
                              setProfileErrors((prev) => ({
                                ...prev,
                                fullName: undefined,
                              }));
                            }
                          }}
                          placeholder="Nhập họ và tên (2 - 100 ký tự)"
                          className={`rounded-xl border bg-white px-3.5 py-2 text-sm text-text-main focus:outline-none ${
                            profileErrors.fullName
                              ? "border-rose-400 focus:border-rose-500"
                              : "border-border focus:border-primary"
                          }`}
                        />
                        <div className="min-h-4">
                          {profileErrors.fullName && (
                            <p className="text-xs text-status-error">
                              {profileErrors.fullName}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="py-1 text-sm font-semibold text-text-main">
                        {account.fullName}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-text-muted">
                      Số điện thoại
                    </label>
                    {isEditingProfile ? (
                      <>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (profileErrors.phone) {
                              setProfileErrors((prev) => ({
                                ...prev,
                                phone: undefined,
                              }));
                            }
                          }}
                          placeholder="Ví dụ: +84901234567 (để trống để xóa)"
                          className={`rounded-xl border bg-white px-3.5 py-2 text-sm text-text-main focus:outline-none ${
                            profileErrors.phone
                              ? "border-rose-400 focus:border-rose-500"
                              : "border-border focus:border-primary"
                          }`}
                        />
                        <div className="min-h-4">
                          {profileErrors.phone && (
                            <p className="text-xs text-status-error">
                              {profileErrors.phone}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="py-1 text-sm font-semibold text-text-main">
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

                  <div className="flex flex-col gap-1.5 pt-2">
                    <span className="text-xs font-medium text-text-muted">
                      Trạng thái
                    </span>
                    <p className="text-sm font-semibold text-text-main">
                      {account.status}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2">
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
              className="flex max-w-xl flex-col gap-5"
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

              <div className="flex flex-col gap-3 rounded-2xl border border-border p-5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-muted">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (pwErrors.currentPassword) {
                          setPwErrors((prev) => ({
                            ...prev,
                            currentPassword: undefined,
                          }));
                        }
                      }}
                      placeholder="Nhập mật khẩu hiện tại"
                      className={`w-full rounded-xl border bg-white py-2 pr-10 pl-3.5 text-sm text-text-main focus:outline-none ${
                        pwErrors.currentPassword
                          ? "border-rose-400 focus:border-rose-500"
                          : "border-border focus:border-primary"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw((v) => !v)}
                      className="absolute right-3 cursor-pointer text-text-muted hover:text-text-main"
                    >
                      <MorphIcon
                        icon={showCurrentPw ? EyeOff : Eye}
                        size={20}
                      />
                    </button>
                  </div>
                  <div className="min-h-4">
                    {pwErrors.currentPassword && (
                      <p className="text-xs text-status-error">
                        {pwErrors.currentPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-muted">
                    Mật khẩu mới
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (pwErrors.newPassword) {
                          setPwErrors((prev) => ({
                            ...prev,
                            newPassword: undefined,
                          }));
                        }
                      }}
                      placeholder="Tối thiểu 8 ký tự"
                      className={`w-full rounded-xl border bg-white py-2 pr-10 pl-3.5 text-sm text-text-main focus:outline-none ${
                        pwErrors.newPassword
                          ? "border-rose-400 focus:border-rose-500"
                          : "border-border focus:border-primary"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      className="absolute right-3 cursor-pointer text-text-muted hover:text-text-main"
                    >
                      <MorphIcon icon={showNewPw ? EyeOff : Eye} size={20} />
                    </button>
                  </div>
                  <div className="min-h-4">
                    {pwErrors.newPassword && (
                      <p className="text-xs text-status-error">
                        {pwErrors.newPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-muted">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (pwErrors.confirmPassword) {
                        setPwErrors((prev) => ({
                          ...prev,
                          confirmPassword: undefined,
                        }));
                      }
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                    className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-text-main focus:outline-none ${
                      pwErrors.confirmPassword
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-border focus:border-primary"
                    }`}
                  />
                  <div className="min-h-4">
                    {pwErrors.confirmPassword && (
                      <p className="text-xs text-status-error">
                        {pwErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 text-xs text-text-main">
                  <input
                    type="checkbox"
                    checked={revokeAllSessions}
                    onChange={(e) => setRevokeAllSessions(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  Đăng xuất khỏi tất cả các thiết bị khác sau khi đổi mật khẩu
                </label>

                <div className="min-h-4">
                  {pwErrors.general && (
                    <p className="text-xs font-medium text-status-error">
                      {pwErrors.general}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
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
                <h2 className="text-lg font-bold text-status-error">
                  Xóa tài khoản
                </h2>
                <p className="text-xs text-text-muted">
                  Quản lý việc đóng vĩnh viễn tài khoản của bạn trên hệ thống.
                </p>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 size-5 shrink-0 text-status-error" />
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
