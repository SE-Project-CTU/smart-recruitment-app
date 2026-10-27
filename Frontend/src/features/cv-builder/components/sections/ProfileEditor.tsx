import React from "react";
import { useFormContext } from "react-hook-form";
import type { CvEditorValues } from "../../schema/cvSchema";

interface ProfileEditorProps {
  isReadOnly?: boolean;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ isReadOnly = false }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CvEditorValues>();

  const profileErrors = errors.content?.profile;

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
      <h3 className="mb-4 text-base font-semibold text-text-main">Thông tin cá nhân (Profile)</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Họ tên */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">
            Họ và tên <span className="text-status-error">*</span>
          </label>
          <input
            {...register("content.profile.fullName")}
            disabled={isReadOnly}
            placeholder="Nguyễn Văn A"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
          />
          {profileErrors?.fullName && (
            <p className="mt-1 text-xs text-status-error">{profileErrors.fullName.message}</p>
          )}
        </div>

        {/* Chức danh */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">
            Chức danh nghề nghiệp <span className="text-status-error">*</span>
          </label>
          <input
            {...register("content.profile.title")}
            disabled={isReadOnly}
            placeholder="Fullstack Developer"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
          />
          {profileErrors?.title && (
            <p className="mt-1 text-xs text-status-error">{profileErrors.title.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">
            Email liên hệ <span className="text-status-error">*</span>
          </label>
          <input
            {...register("content.profile.email")}
            disabled={isReadOnly}
            placeholder="email@example.com"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
          />
          {profileErrors?.email && (
            <p className="mt-1 text-xs text-status-error">{profileErrors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">
            Số điện thoại <span className="text-status-error">*</span>
          </label>
          <input
            {...register("content.profile.phone")}
            disabled={isReadOnly}
            placeholder="0901234567"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
          />
          {profileErrors?.phone && (
            <p className="mt-1 text-xs text-status-error">{profileErrors.phone.message}</p>
          )}
        </div>

        {/* Ngày sinh */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">Ngày sinh</label>
          <input
            {...register("content.profile.dob")}
            disabled={isReadOnly}
            placeholder="1998-05-20"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
          />
        </div>

        {/* Địa chỉ */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">Địa chỉ</label>
          <input
            {...register("content.profile.address")}
            disabled={isReadOnly}
            placeholder="Quận Ninh Kiều, Cần Thơ"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
          />
        </div>

        {/* Website */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">Website / Portfolio</label>
          <input
            {...register("content.profile.website")}
            disabled={isReadOnly}
            placeholder="https://myportfolio.dev"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
          />
        </div>

        {/* Social Link */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">LinkedIn / GitHub</label>
          <input
            {...register("content.profile.socialLink")}
            disabled={isReadOnly}
            placeholder="https://linkedin.com/in/username"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
