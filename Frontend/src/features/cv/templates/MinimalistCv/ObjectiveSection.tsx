import React from "react";
import type { RichTextCVSections } from "@/types/cv";
import type { MinimalistCvSectionProps } from "./types";

/**
 * ObjectiveSection:
 * Khối mục tiêu nghề nghiệp / giới thiệu tóm tắt với nền sáng nhẹ đặc trưng của Minimalist CV.
 */
export const ObjectiveSection: React.FC<
  MinimalistCvSectionProps<RichTextCVSections["objective"]>
> = React.memo(({ section, isReadOnly = false, renderField }) => {
  if (section.visible === false) return null;

  return (
    <section className="section-objective break-inside-avoid rounded-sm border border-slate-100 bg-slate-50/90 p-3.5">
      <div className="text-[12.5px] leading-relaxed text-slate-700">
        {renderField({
          name: "content.sections.objective.content",
          document: section.content,
          placeholder:
            "Tóm tắt ngắn gọn về kinh nghiệm, thành tựu nổi bật và mục tiêu nghề nghiệp của bạn...",
          multiline: true,
          isReadOnly,
        })}
      </div>
    </section>
  );
});

ObjectiveSection.displayName = "ObjectiveSection";
