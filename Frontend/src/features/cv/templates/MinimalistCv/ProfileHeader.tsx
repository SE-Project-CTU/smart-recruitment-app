import React, { useRef, useState, useCallback, useMemo } from "react";
import { Camera, Loader2 } from "lucide-react";
import type { RichTextCVProfile } from "@/types/cv";
import { extractTiptapPlainText } from "../../builder/utils/tiptapJson";
import type { CvFieldRenderer } from "../types";
import { ImageUploadDialog } from "@/components/common/ImageUploadDialog";
import { useImageCropUpload } from "@/components/common/useImageCropUpload";
import { mediaService } from "@/services/mediaService";
import { useDeleteMedia } from "@/hooks/queries/useMedia";
import { toast } from "@/components/ui/toast";
import { useFormContext } from "react-hook-form";
import type { RichTextCvEditorValues } from "../../builder/schema/richTextCvSchema";

interface ProfileHeaderProps {
  profile: RichTextCVProfile;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

/**
 * ProfileHeader:
 * Phần đầu CV Minimalist: ảnh chân dung 3:4 bên trái,
 * họ tên và chức vụ kèm vạch đứng màu chủ đạo bên phải.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = React.memo(
  ({ profile, isReadOnly = false, renderField }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [imgFailed, setImgFailed] = useState(false);
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

          if (lastUploadedFileIdRef.current) {
            await safeDeleteMedia(lastUploadedFileIdRef.current);
          }

          lastUploadedFileIdRef.current = newFileId;
          setImgFailed(false);

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
            description:
              "Không thể tải ảnh đại diện lên máy chủ. Vui lòng thử lại.",
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
        description: "Đã gỡ ảnh đại diện khỏi CV.",
      });
      return true;
    }, [isReadOnly, formContext, safeDeleteMedia]);

    const uploadFlow = useImageCropUpload({
      onUpload: handleCropConfirm,
      onRemove: handleRemoveAvatar,
    });

    const avatarSrc = useMemo(
      () => profile?.avatarUrl?.trim() || undefined,
      [profile?.avatarUrl],
    );

    const fullNamePlainText = useMemo(
      () => extractTiptapPlainText(profile?.fullName) || "Ứng viên",
      [profile?.fullName],
    );

    const hasAvatar = Boolean(avatarSrc) && !imgFailed;

    return (
      <header className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* Ảnh chân dung hình chữ nhật đứng (3:4) */}
        {(hasAvatar || !isReadOnly) && (
          <div className="shrink-0">
            <div
              role={!isReadOnly ? "button" : undefined}
              tabIndex={!isReadOnly ? 0 : undefined}
              onClick={() => {
                if (!isReadOnly && !isUploading) uploadFlow.open();
              }}
              onKeyDown={(e) => {
                if (
                  !isReadOnly &&
                  !isUploading &&
                  (e.key === "Enter" || e.key === " ")
                ) {
                  e.preventDefault();
                  uploadFlow.open();
                }
              }}
              title={!isReadOnly ? "Nhấn để đổi ảnh đại diện" : undefined}
              className={`group/avatar relative h-[168px] w-[126px] overflow-hidden rounded-sm border border-slate-200 bg-slate-100 transition-all ${
                !isReadOnly
                  ? "cursor-pointer hover:border-slate-400"
                  : ""
              }`}
            >
              {hasAvatar ? (
                <img
                  src={avatarSrc}
                  alt={fullNamePlainText}
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-400">
                  <Camera className="h-6 w-6" />
                  <span className="text-[11px] font-medium">Chọn ảnh</span>
                </div>
              )}

              {!isReadOnly && (
                <div
                  className={`no-print absolute inset-0 flex flex-col items-center justify-center bg-slate-900/55 text-white transition-opacity duration-200 ${
                    isUploading
                      ? "opacity-100"
                      : "opacity-0 group-hover/avatar:opacity-100"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mb-1 h-5 w-5 animate-spin" />
                      <span className="text-[11px] font-medium">Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="mb-1 h-5 w-5" />
                      <span className="text-[11px] font-medium">
                        {hasAvatar ? "Đổi ảnh" : "Chọn ảnh"}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tên ứng viên & Vị trí công việc kèm vạch đứng màu chủ đạo */}
        <div className="min-w-0 flex-1 pt-1">
          <div
            className="border-l-4 pl-3.5"
            style={{ borderColor: "var(--cv-primary-1, #1E293B)" }}
          >
            <h1
              className="text-2xl font-bold tracking-tight text-slate-900"
              style={{ color: "var(--cv-primary-2, #0F172A)" }}
            >
              {renderField({
                name: "content.profile.fullName",
                document: profile?.fullName,
                placeholder: "HỌ VÀ TÊN",
                isReadOnly,
              })}
            </h1>
            <div className="mt-1 text-[14px] font-medium text-slate-700">
              {renderField({
                name: "content.profile.title",
                document: profile?.title,
                placeholder: "Vị trí ứng tuyển",
                isReadOnly,
              })}
            </div>
          </div>
        </div>

        {!isReadOnly && (
          <ImageUploadDialog
            flow={uploadFlow}
            currentImageUrl={avatarSrc}
            imageAlt={fullNamePlainText}
            title="Cập nhật ảnh đại diện CV"
            description="Chọn ảnh chân dung tỉ lệ 3:4 phù hợp với mẫu Minimalist CV."
            aspectRatio={3 / 4}
            shape="rectangle"
            maxOutputDimension={600}
          />
        )}
      </header>
    );
  },
);

ProfileHeader.displayName = "ProfileHeader";
