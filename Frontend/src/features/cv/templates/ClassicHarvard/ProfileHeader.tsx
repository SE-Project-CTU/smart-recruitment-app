import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  User as UserIcon,
  Globe,
  Camera,
} from "lucide-react";
import type { RichTextCVProfile, CvTiptapDocument } from "@/types/cv";
import { extractTiptapPlainText } from "../../builder/utils/tiptapJson";
import type { CvFieldRenderer } from "../types";

interface ProfileHeaderProps {
  profile: RichTextCVProfile;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  primaryColor = "#0F172A",
  isReadOnly = false,
  renderField,
}) => {
  const hasText = (document?: CvTiptapDocument) =>
    Boolean(document && extractTiptapPlainText(document).trim());
  const shouldShowField = (document?: CvTiptapDocument) =>
    !isReadOnly || hasText(document);

  return (
    <header className="mb-6 flex flex-row items-center gap-6 border-b border-slate-200 pb-5">
      {/* 1. Avatar tròn bên trái */}
      <div className="relative shrink-0">
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt="Avatar"
            className="h-28 w-28 rounded-full border-2 border-slate-200 object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400">
            <Camera className="h-8 w-8" />
          </div>
        )}
      </div>

      {/* 2. Họ tên, Chức danh & Lưới liên hệ */}
      <div className="flex-1 text-left">
        <h1
          className="cv-text-title font-bold tracking-tight text-slate-900"
          style={{ color: primaryColor }}
        >
          {renderField({
            name: "content.profile.fullName",
            document: profile?.fullName,
            placeholder: "Họ và tên",
            isReadOnly,
          })}
        </h1>

        <div className="mt-0.5 inline-block border-b-2 border-slate-800 pb-0.5">
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
};
