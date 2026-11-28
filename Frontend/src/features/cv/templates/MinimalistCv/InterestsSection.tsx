import React from "react";
import type { RichTextCVSections } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import type { MinimalistCvSectionProps } from "./types";

export const InterestsSection: React.FC<
  MinimalistCvSectionProps<RichTextCVSections["interests"]>
> = React.memo(({ section, isReadOnly = false, renderField }) => {
  if (section.visible === false) return null;

  return (
    <section className="section-interests break-inside-avoid">
      <SectionTitle
        placeholder="SỞ THÍCH"
        fieldName="content.sections.interests.title"
        title={section.title}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />

      <div className="text-[12px] leading-relaxed text-slate-700">
        {renderField({
          name: "content.sections.interests.content",
          document: section.content,
          placeholder: "Đọc sách, thể thao, nghiên cứu...",
          multiline: true,
          isReadOnly,
        })}
      </div>
    </section>
  );
});

InterestsSection.displayName = "InterestsSection";
