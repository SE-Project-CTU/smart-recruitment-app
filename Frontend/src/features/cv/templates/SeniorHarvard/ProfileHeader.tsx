import React from "react";
import { Phone, Mail, Globe, MapPin, CalendarDays, Link as LinkIcon } from "lucide-react";
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
  const hasContactInfo = Boolean(
    hasText(profile?.phone) ||
    hasText(profile?.email) ||
    hasText(profile?.website) ||
    hasText(profile?.socialLink) ||
    hasText(profile?.address) ||
    hasText(profile?.dob),
  );

  return (
    <div className="flex flex-col items-center px-4 text-center">
      <h1
        className="cv-text-title w-full font-bold tracking-tight text-slate-900"
        style={{ color: primaryColor }}
      >
        {renderField({
          name: "content.profile.fullName",
          document: profile?.fullName,
          placeholder: "Họ và tên",
          isReadOnly,
        })}
      </h1>
      <h2 className="cv-text-subtitle mt-1 w-full font-semibold tracking-wide text-slate-700">
        {renderField({
          name: "content.profile.title",
          document: profile?.title,
          placeholder: "Chức danh nghề nghiệp",
          isReadOnly,
        })}
      </h2>

      {(!isReadOnly || hasContactInfo) && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-slate-600">
          {shouldShowField(profile?.phone) && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-800" />
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
              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-800" />
              {renderField({
                name: "content.profile.email",
                document: profile?.email,
                placeholder: "Email",
                isReadOnly,
              })}
            </div>
          )}

          {shouldShowField(profile?.website) && (
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 shrink-0 text-slate-800" />
              {renderField({
                name: "content.profile.website",
                document: profile?.website,
                placeholder: "Website cá nhân / Portfolio",
                isReadOnly,
              })}
            </div>
          )}

          {shouldShowField(profile?.socialLink) && (
            <div className="flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5 shrink-0 text-slate-800" />
              {renderField({
                name: "content.profile.socialLink",
                document: profile?.socialLink,
                placeholder: "LinkedIn / GitHub",
                isReadOnly,
              })}
            </div>
          )}

          {shouldShowField(profile?.address) && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-800" />
              {renderField({
                name: "content.profile.address",
                document: profile?.address,
                placeholder: "Địa chỉ (Quận, Tỉnh/Thành phố)",
                isReadOnly,
              })}
            </div>
          )}

          {shouldShowField(profile?.dob) && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-800" />
              {renderField({
                name: "content.profile.dob",
                document: profile?.dob,
                placeholder: "Ngày sinh",
                isReadOnly,
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
