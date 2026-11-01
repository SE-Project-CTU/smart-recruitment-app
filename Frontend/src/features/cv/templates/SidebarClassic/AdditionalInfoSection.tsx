import React from "react";
import type { RichTextCVTextSection } from "@/types/cv";
import { SidebarSectionTitle } from "./SectionTitle";
import type { CvFieldRenderer } from "../types";

interface AdditionalInfoSectionProps {
  section: RichTextCVTextSection;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

export const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  section,
  primaryColor = "#262626",
  isReadOnly = false,
  renderField,
}) => {
  if (!section.visible) return null;

  return (
    <section className="section-additionalInfo group relative mb-4">
      <SidebarSectionTitle
        placeholder="NGƯỜI GIỚI THIỆU"
        fieldName="content.sections.additionalInfo.title"
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="text-xs text-slate-800 leading-relaxed min-h-4 px-1">
        {renderField({
          name: "content.sections.additionalInfo.content",
          document: section.content,
          placeholder: "Nhập thông tin người giới thiệu...",
          multiline: true,
          isReadOnly,
        })}
      </div>
    </section>
  );
};
