import React, { useRef, useState } from "react";
import {
  Camera,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import type { RichTextCVProfile, CvTiptapDocument } from "@/types/cv";
import { extractTiptapPlainText } from "../../builder/utils/tiptapJson";
import type { CvFieldRenderer } from "../types";
import { UserAvatar } from "@/components/common/UserAvatar";
import { mediaService } from "@/services/mediaService";
import { toast } from "@/components/ui/toast";
import { useFormContext } from "react-hook-form";
import type { RichTextCvEditorValues } from "../../builder/schema/richTextCvSchema";

interface SidebarProfileProps {
  profile: RichTextCVProfile;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

export const SidebarProfile: React.FC<SidebarProfileProps> = ({
  profile,
  primaryColor = "#262626",
  isReadOnly = false,
  renderField,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Lấy hàm setValue từ react-hook-form nếu đang trong form context
  const formContext = useFormContext<RichTextCvEditorValues>();

  const hasText = (document?: CvTiptapDocument) =>
    Boolean(document && extractTiptapPlainText(document).trim());
  const shouldShowField = (document?: CvTiptapDocument) =>
    !isReadOnly || hasText(document);

  const handleAvatarClick = () => {
    if (isReadOnly || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.add({
        type: "error",
        description: "Vui lòng chọn file hình ảnh (PNG, JPG, WEBP).",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        type: "error",
        description: "Ảnh đại diện tối đa 5MB.",
      });
      return;
    }

    try {
      setIsUploading(true);
      const res = await mediaService.uploadImage(file);
      const url = res.data.fileUrl;
      if (formContext) {
        formContext.setValue("content.profile.avatarUrl", url, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      toast.add({
        type: "success",
        description: "Đã cập nhật ảnh đại diện CV.",
      });
    } catch {
      toast.add({
        type: "error",
        description: "Không thể tải ảnh đại diện lên máy chủ. Vui lòng thử lại.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReadOnly) return;
    if (formContext) {
      formContext.setValue("content.profile.avatarUrl", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const avatarSrc = profile?.avatarUrl;

  return (
    <div className="flex flex-col items-center text-center">
      {/* 1. Họ và tên & Chức danh ở TRÊN ảnh */}
      <div className="w-full mb-5">
        <h1
          className="w-full text-2xl font-bold tracking-tight leading-snug"
          style={{ color: primaryColor }}
        >
          {renderField({
            name: "content.profile.fullName",
            document: profile?.fullName,
            placeholder: "Họ và tên",
            isReadOnly,
          })}
        </h1>
        <h2 className="mt-1.5 w-full text-base font-medium tracking-normal text-slate-800">
          {renderField({
            name: "content.profile.title",
            document: profile?.title,
            placeholder: "Chức danh",
            isReadOnly,
          })}
        </h2>
      </div>

      {/* 2. Ảnh đại diện dạng tròn với viền trắng nổi bật */}
      <div className="relative mb-6 group/avatar">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isReadOnly || isUploading}
        />

        <div
          onClick={handleAvatarClick}
          className={`relative h-44 w-44 rounded-full p-2 bg-white shadow-sm flex items-center justify-center transition-all ${
            !isReadOnly
              ? "cursor-pointer hover:ring-2 hover:ring-slate-400"
              : ""
          }`}
          title={!isReadOnly ? "Nhấn để thay đổi ảnh đại diện" : undefined}
        >
          <div className="h-full w-full rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
            {avatarSrc ? (
              <UserAvatar
                src={avatarSrc}
                name={extractTiptapPlainText(profile.fullName)}
                className="h-full w-full object-cover"
                alt="Avatar"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <Camera className="h-10 w-10 stroke-[1.5]" />
                {!isReadOnly && (
                  <span className="text-[11px] font-medium mt-1.5 text-slate-500">
                    Chọn ảnh
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Overlay khi upload */}
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-[10px] mt-1">Đang tải...</span>
            </div>
          )}

          {/* Hover overlay & nút thao tác trong chế độ builder */}
          {!isReadOnly && !isUploading && (
            <div className="no-print absolute inset-0 rounded-full bg-black/35 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1.5">
              <div className="flex items-center gap-1 text-[11px] font-medium bg-black/60 px-2.5 py-1 rounded-full">
                <Upload className="h-3.5 w-3.5" />
                <span>Đổi ảnh</span>
              </div>
              {avatarSrc && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="flex items-center gap-1 text-[10px] text-rose-300 hover:text-rose-100 bg-rose-900/60 px-2 py-0.5 rounded-full"
                  title="Xóa ảnh"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Xóa</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Tiêu đề THÔNG TIN CÁ NHÂN (Hộp chữ nhật nền đen chữ trắng) */}
      <div className="w-full mb-3">
        <div
          className="w-full py-1.5 px-3 text-center text-xs font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: primaryColor }}
        >
          THÔNG TIN CÁ NHÂN
        </div>
      </div>

      {/* 4. Danh sách thông tin cá nhân dạng ký tự M, @, W, biểu tượng định vị */}
      <div className="w-full space-y-2 text-left text-xs text-slate-800 px-1">
        {/* Số điện thoại (Icon M) */}
        {shouldShowField(profile?.phone) && (
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-[13px] w-4 text-center shrink-0 text-slate-900">
              M
            </span>
            <div className="flex-1 min-w-0">
              {renderField({
                name: "content.profile.phone",
                document: profile?.phone,
                placeholder: "Số điện thoại",
                isReadOnly,
              })}
            </div>
          </div>
        )}

        {/* Ngày sinh (Icon lịch) */}
        {shouldShowField(profile?.dob) && (
          <div className="flex items-center gap-2.5">
            <span className="w-4 text-center shrink-0 flex justify-center text-slate-800">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              {renderField({
                name: "content.profile.dob",
                document: profile?.dob,
                placeholder: "Ngày sinh (dd/mm/yyyy)",
                isReadOnly,
              })}
            </div>
          </div>
        )}

        {/* Email (Icon @) */}
        {shouldShowField(profile?.email) && (
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-[13px] w-4 text-center shrink-0 text-slate-900">
              @
            </span>
            <div className="flex-1 min-w-0">
              {renderField({
                name: "content.profile.email",
                document: profile?.email,
                placeholder: "Email",
                isReadOnly,
              })}
            </div>
          </div>
        )}

        {/* Website / Portfolio (Icon W) */}
        {shouldShowField(profile?.website) && (
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-[13px] w-4 text-center shrink-0 text-slate-900">
              W
            </span>
            <div className="flex-1 min-w-0">
              {renderField({
                name: "content.profile.website",
                document: profile?.website,
                placeholder: "Website / Portfolio",
                isReadOnly,
              })}
            </div>
          </div>
        )}

        {/* Địa chỉ (Icon Map Pin) */}
        {shouldShowField(profile?.address) && (
          <div className="flex items-center gap-2.5">
            <span className="w-4 text-center shrink-0 flex justify-center text-slate-800">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              {renderField({
                name: "content.profile.address",
                document: profile?.address,
                placeholder: "Địa chỉ (Quận, Tỉnh/Thành phố)",
                isReadOnly,
              })}
            </div>
          </div>
        )}

        {/* Mạng xã hội / LinkedIn (Icon L/Link) */}
        {shouldShowField(profile?.socialLink) && (
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-[13px] w-4 text-center shrink-0 text-slate-900">
              in
            </span>
            <div className="flex-1 min-w-0">
              {renderField({
                name: "content.profile.socialLink",
                document: profile?.socialLink,
                placeholder: "LinkedIn / Mạng xã hội",
                isReadOnly,
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
