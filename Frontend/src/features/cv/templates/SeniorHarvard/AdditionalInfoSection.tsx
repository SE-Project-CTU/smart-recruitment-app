import React from "react";
import type { RichTextCVTextSection } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import type { CvFieldRenderer } from "../types";

export interface AdditionalInfoSectionProps {
  section: RichTextCVTextSection;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

export const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  section,
  primaryColor,
  isReadOnly = false,
  renderField,
}) => {
  if (section.visible === false) return null;

  return (
    <section className="section-additionalInfo group relative mb-3">
      <SectionTitle
        placeholder="THÔNG TIN BỔ SUNG"
        fieldName="content.sections.additionalInfo.title"
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="min-h-5 text-slate-700">
        {renderField({
          name: "content.sections.additionalInfo.content",
          document: section.content,
          placeholder: "Mô tả thông tin bổ sung của bạn...",
          multiline: true,
          isReadOnly,
        })}
      </div>
    </section>
  );
};
