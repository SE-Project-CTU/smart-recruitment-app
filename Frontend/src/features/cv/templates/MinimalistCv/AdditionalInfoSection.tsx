import React from "react";
import type { RichTextCVSections } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import type { MinimalistCvSectionProps } from "./types";

export const AdditionalInfoSection: React.FC<
  MinimalistCvSectionProps<RichTextCVSections["additionalInfo"]>
> = React.memo(({ section, isReadOnly = false, renderField }) => {
  if (section.visible === false) return null;

  return (
    <section className="section-additional-info break-inside-avoid">
      <SectionTitle
        placeholder="NGƯỜI GIỚI THIỆU"
        fieldName="content.sections.additionalInfo.title"
        title={section.title}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />

      <div className="text-[12px] leading-relaxed text-slate-700">
        {renderField({
          name: "content.sections.additionalInfo.content",
          document: section.content,
          placeholder: "Thông tin người giới thiệu hoặc ghi chú thêm...",
          multiline: true,
          isReadOnly,
        })}
      </div>
    </section>
  );
});

AdditionalInfoSection.displayName = "AdditionalInfoSection";
