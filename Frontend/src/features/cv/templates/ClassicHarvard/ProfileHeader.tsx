import React, { useRef, useState, useCallback, useMemo } from "react";
import {
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  User as UserIcon,
  Globe,
  Camera,
  Loader2,
} from "lucide-react";
import type { RichTextCVProfile, CvTiptapDocument } from "@/types/cv";
import { extractTiptapPlainText } from "../../builder/utils/tiptapJson";
import type { CvFieldRenderer } from "../types";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ImageUploadDialog } from "@/components/common/ImageUploadDialog";
import { useImageCropUpload } from "@/components/common/useImageCropUpload";
import { mediaService } from "@/services/mediaService";
import { useDeleteMedia } from "@/hooks/queries/useMedia";
import { toast } from "@/components/ui/toast";
import { useFormContext } from "react-hook-form";
import type { RichTextCvEditorValues } from "../../builder/schema/richTextCvSchema";

interface ProfileHeaderProps {
  profile: RichTextCVProfile;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = React.memo(({
  profile,
  primaryColor = "#0F172A",
  isReadOnly = false,
  renderField,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const lastUploadedFileIdRef = useRef<string | null>(null);

  const { mutateAsync: deleteMedia } = useDeleteMedia();

  const safeDeleteMedia = useCallback(
    async (fileId: string | null) => {
      if (!fileId) return;
      try {
        await deleteMedia(fileId);
      } catch (err) {
        console.warn("Không thể xóa file media đã loại bỏ:", err);
      }
    },
    [deleteMedia],
  );

  const formContext = useFormContext<RichTextCvEditorValues>();

  const hasText = useCallback(
    (document?: CvTiptapDocument) =>
      Boolean(document && extractTiptapPlainText(document).trim()),
    [],
  );

  const shouldShowField = useCallback(
    (document?: CvTiptapDocument) => !isReadOnly || hasText(document),
    [isReadOnly, hasText],
  );

  const handleCropConfirm = useCallback(
    async (croppedFile: File): Promise<boolean> => {
      if (croppedFile.size > 5 * 1024 * 1024) {
        toast.add({
          type: "error",
          description: "Ảnh sau khi căn chỉnh vẫn vượt quá 5MB.",
        });
        return false;
      }

      try {
        setIsUploading(true);
        const res = await mediaService.uploadImage(croppedFile);
        const newUrl = res.data.fileUrl;
        const newFileId = res.data.id;

        // Xóa file cũ nếu đã tải lên trong phiên
        if (lastUploadedFileIdRef.current) {
          await safeDeleteMedia(lastUploadedFileIdRef.current);
        }

        lastUploadedFileIdRef.current = newFileId;

        if (formContext) {
          formContext.setValue("content.profile.avatarUrl", newUrl, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
        toast.add({
          type: "success",
          description: "Đã cập nhật ảnh đại diện CV.",
        });
        return true;
      } catch {
        toast.add({
          type: "error",
          description: "Không thể tải ảnh đại diện lên máy chủ. Vui lòng thử lại.",
        });
        return false;
      } finally {
        setIsUploading(false);
      }
    },
    [formContext, safeDeleteMedia],
  );

  const handleRemoveAvatar = useCallback(async (): Promise<boolean> => {
    if (isReadOnly) return false;

    if (lastUploadedFileIdRef.current) {
      await safeDeleteMedia(lastUploadedFileIdRef.current);
      lastUploadedFileIdRef.current = null;
    }

    if (formContext) {
      formContext.setValue("content.profile.avatarUrl", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    toast.add({
      type: "success",
      description: "Đã xóa ảnh đại diện CV.",
    });
    return true;
  }, [isReadOnly, formContext, safeDeleteMedia]);

  const imageFlow = useImageCropUpload({
    maxFileSizeBytes: 5 * 1024 * 1024,
    onUpload: handleCropConfirm,
    onRemove: handleRemoveAvatar,
  });

  const handleAvatarClick = useCallback(() => {
    if (isReadOnly || isUploading) return;
    imageFlow.open();
  }, [isReadOnly, isUploading, imageFlow]);

  const avatarSrc = useMemo(() => profile?.avatarUrl, [profile?.avatarUrl]);

  return (
    <header className="mb-6 flex flex-row items-center gap-6 border-b border-slate-200 pb-5">
      {/* 1. Avatar tròn bên trái với viền nhẹ và hỗ trợ upload/crop */}
      <div className="relative shrink-0 group/avatar">
        <div
          onClick={handleAvatarClick}
          role={!isReadOnly ? "button" : undefined}
          tabIndex={!isReadOnly ? 0 : undefined}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleAvatarClick();
            }
          }}
          className={`relative h-28 w-28 rounded-full border-2 border-slate-200 bg-white p-1 shadow-sm flex items-center justify-center transition-all ${
            !isReadOnly
              ? "cursor-pointer hover:ring-2 hover:ring-slate-400"
              : ""
          }`}
          title={!isReadOnly ? "Nhấn để thay đổi ảnh đại diện" : undefined}
        >
          <div className="h-full w-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
            {avatarSrc ? (
              <UserAvatar
                src={avatarSrc}
                name={extractTiptapPlainText(profile.fullName)}
                className="h-full w-full object-cover"
                alt="Avatar"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <Camera className="h-8 w-8 stroke-[1.5]" />
                {!isReadOnly && (
                  <span className="text-[10px] font-medium mt-1 text-slate-500">
                    Chọn ảnh
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Overlay khi upload */}
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center text-white">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-[9px] mt-0.5">Đang tải...</span>
            </div>
          )}

          {/* Hover overlay trong chế độ builder */}
          {!isReadOnly && !isUploading && (
            <div className="no-print absolute inset-0 rounded-full bg-black/35 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
              <div className="flex items-center gap-1 text-[10px] font-medium bg-black/60 px-2 py-0.5 rounded-full">
                <Camera className="h-3 w-3" />
                <span>Đổi ảnh</span>
              </div>
            </div>
          )}
        </div>

        <ImageUploadDialog
          flow={imageFlow}
          currentImageUrl={avatarSrc}
          imageAlt="Ảnh hồ sơ hiện tại"
          title="Ảnh hồ sơ CV"
          description="Chọn ảnh mới để căn chỉnh trước khi tải lên CV."
          aspectRatio={1}
          shape="circle"
          maxOutputDimension={512}
        />
      </div>

      {/* 2. Họ tên, Chức danh & Lưới liên hệ */}
      <div className="flex-1 text-left">
        <h1
          className="cv-text-title font-bold tracking-tight"
          style={{ color: `var(--cv-primary-1, ${primaryColor})` }}
        >
          {renderField({
            name: "content.profile.fullName",
            document: profile?.fullName,
            placeholder: "Họ và tên",
            isReadOnly,
          })}
        </h1>

        <div
          className="mt-0.5 inline-block border-b-2 pb-0.5 transition-colors duration-150"
          style={{ borderColor: `var(--cv-primary-1, ${primaryColor})` }}
        >
          <h2 className="cv-text-subtitle font-semibold tracking-wide text-slate-700">
            {renderField({
              name: "content.profile.title",
              document: profile?.title,
              placeholder: "Chức danh nghề nghiệp",
              isReadOnly,
            })}
          </h2>
        </div>

        {/* Lưới thông tin liên hệ 3 cột / 2 dòng */}
        <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-1.5 text-xs text-slate-600">
          {shouldShowField(profile?.dob) && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-700" />
              {renderField({
                name: "content.profile.dob",
                document: profile?.dob,
                placeholder: "Ngày sinh",
                isReadOnly,
              })}
            </div>
          )}

          {shouldShowField(profile?.phone) && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-700" />
              {renderField({
                name: "content.profile.phone",
                document: profile?.phone,
                placeholder: "Số điện thoại",
                isReadOnly,
              })}
            </div>
          )}

          {shouldShowField(profile?.email) && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-700" />
              {renderField({
                name: "content.profile.email",
                document: profile?.email,
                placeholder: "Email",
                isReadOnly,
              })}
            </div>
          )}

          {shouldShowField(profile?.socialLink) && (
            <div className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5 shrink-0 text-slate-700" />
              {renderField({
                name: "content.profile.socialLink",
                document: profile?.socialLink,
                placeholder: "Giới tính",
                isReadOnly,
              })}
            </div>
          )}

          {shouldShowField(profile?.address) && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-700" />
              {renderField({
                name: "content.profile.address",
                document: profile?.address,
                placeholder: "Địa chỉ",
                isReadOnly,
              })}
            </div>
          )}

          {shouldShowField(profile?.website) && (
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 shrink-0 text-slate-700" />
              {renderField({
                name: "content.profile.website",
                document: profile?.website,
                placeholder: "LinkedIn / Portfolio",
                isReadOnly,
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

ProfileHeader.displayName = "ProfileHeader";
