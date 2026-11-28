import React, { useCallback } from "react";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  CalendarDays,
  Link as LinkIcon,
} from "lucide-react";
import type { RichTextCVProfile, CvTiptapDocument } from "@/types/cv";
import { extractTiptapPlainText } from "../../builder/utils/tiptapJson";
import type { CvFieldRenderer } from "../types";

interface ContactInfoBlockProps {
  profile: RichTextCVProfile;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

/**
 * ContactInfoBlock:
 * Khối THÔNG TIN CÁ NHÂN ở đầu cột phải (sidebar) theo đúng bố cục mockup Minimalist CV.
 */
export const ContactInfoBlock: React.FC<ContactInfoBlockProps> = React.memo(
  ({ profile, isReadOnly = false, renderField }) => {
    const hasText = useCallback(
      (doc?: CvTiptapDocument) =>
        Boolean(doc && extractTiptapPlainText(doc).trim()),
      [],
    );

    const shouldShow = useCallback(
      (doc?: CvTiptapDocument) => !isReadOnly || hasText(doc),
      [isReadOnly, hasText],
    );

    return (
      <section className="mb-5 break-inside-avoid">
        <div
          className="mb-3 break-after-avoid border-b-2 pb-1"
          style={{ borderColor: "var(--cv-primary-1, #1E293B)" }}
        >
          <h3
            className="text-[14px] font-bold tracking-wide uppercase"
            style={{ color: "var(--cv-primary-2, #0F172A)" }}
          >
            THÔNG TIN CÁ NHÂN
          </h3>
        </div>

        <div className="space-y-2 text-[12px] text-slate-700">
          {shouldShow(profile?.phone) && (
            <div className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-900" />
              <div className="min-w-0 flex-1">
                {renderField({
                  name: "content.profile.phone",
                  document: profile?.phone,
                  placeholder: "Số điện thoại",
                  isReadOnly,
                })}
              </div>
            </div>
          )}

          {shouldShow(profile?.email) && (
            <div className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-900" />
              <div className="min-w-0 flex-1 break-all">
                {renderField({
                  name: "content.profile.email",
                  document: profile?.email,
                  placeholder: "Email",
                  isReadOnly,
                })}
              </div>
            </div>
          )}

          {shouldShow(profile?.website) && (
            <div className="flex items-start gap-2.5">
              <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-900" />
              <div className="min-w-0 flex-1 break-all">
                {renderField({
                  name: "content.profile.website",
                  document: profile?.website,
                  placeholder: "Website / Portfolio",
                  isReadOnly,
                })}
              </div>
            </div>
          )}

          {shouldShow(profile?.address) && (
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-900" />
              <div className="min-w-0 flex-1">
                {renderField({
                  name: "content.profile.address",
                  document: profile?.address,
                  placeholder: "Địa chỉ",
                  isReadOnly,
                })}
              </div>
            </div>
          )}

          {shouldShow(profile?.dob) && (
            <div className="flex items-start gap-2.5">
              <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-900" />
              <div className="min-w-0 flex-1">
                {renderField({
                  name: "content.profile.dob",
                  document: profile?.dob,
                  placeholder: "Ngày sinh",
                  isReadOnly,
                })}
              </div>
            </div>
          )}

          {shouldShow(profile?.socialLink) && (
            <div className="flex items-start gap-2.5">
              <LinkIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-900" />
              <div className="min-w-0 flex-1 break-all">
                {renderField({
                  name: "content.profile.socialLink",
                  document: profile?.socialLink,
                  placeholder: "Liên kết mạng xã hội",
                  isReadOnly,
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  },
);

ContactInfoBlock.displayName = "ContactInfoBlock";
