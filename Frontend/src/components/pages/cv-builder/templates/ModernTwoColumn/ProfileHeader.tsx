import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Phone, Mail, Globe, MapPin, CalendarDays, Link } from "lucide-react";
import { TiptapField } from "../../components/TiptapField";
import type { RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";
import type { CvTiptapDocument } from "@/types/cv";
import { extractTiptapPlainText } from "@/features/cv-builder/utils/tiptapJson";

interface ProfileHeaderProps {
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  primaryColor = "#0F172A",
  isReadOnly = false,
}) => {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const profile = useWatch({ control, name: "content.profile" });
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
        <TiptapField
          name="content.profile.fullName"
          placeholder="Họ và tên"
          isReadOnly={isReadOnly}
        />
      </h1>
      <h2 className="cv-text-subtitle mt-1 w-full font-semibold tracking-wide text-slate-700">
        <TiptapField
          name="content.profile.title"
          placeholder="Chức danh nghề nghiệp"
          isReadOnly={isReadOnly}
        />
      </h2>

      {(!isReadOnly || hasContactInfo) && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-slate-600">
          {shouldShowField(profile?.phone) && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-800" />
              <TiptapField
                name="content.profile.phone"
                placeholder="Số điện thoại"
                isReadOnly={isReadOnly}
              />
            </div>
          )}
          {shouldShowField(profile?.email) && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-800" />
              <TiptapField
                name="content.profile.email"
                placeholder="Email liên hệ"
                isReadOnly={isReadOnly}
              />
            </div>
          )}
          {shouldShowField(profile?.website) && (
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 shrink-0 text-slate-800" />
              <TiptapField
                name="content.profile.website"
                placeholder="Website / Portfolio"
                isReadOnly={isReadOnly}
              />
            </div>
          )}
          {shouldShowField(profile?.socialLink) && (
            <div className="flex items-center gap-1.5">
              <Link className="h-3.5 w-3.5 shrink-0 text-slate-800" />
              <TiptapField
                name="content.profile.socialLink"
                placeholder="LinkedIn / GitHub"
                isReadOnly={isReadOnly}
              />
            </div>
          )}
          {shouldShowField(profile?.address) && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-800" />
              <TiptapField
                name="content.profile.address"
                placeholder="Địa chỉ"
                isReadOnly={isReadOnly}
              />
            </div>
          )}
          {shouldShowField(profile?.dob) && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-800" />
              <TiptapField
                name="content.profile.dob"
                placeholder="Ngày sinh"
                isReadOnly={isReadOnly}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
