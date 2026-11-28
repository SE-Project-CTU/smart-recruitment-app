import React from "react";
import type { RichTextCVSections } from "@/types/cv";
import { ItemActions } from "../../builder/components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type { MinimalistCvSectionProps } from "./types";

/**
 * EducationSection:
 * Khối HỌC VẤN nổi bật với nền sẫm màu chủ đạo (--cv-primary-1) và chữ trắng theo mockup.
 */
export const EducationSection: React.FC<
  MinimalistCvSectionProps<RichTextCVSections["education"]>
> = React.memo(({ section, isReadOnly = false, renderField, actions }) => {
  if (section.visible === false) return null;
  const items = section.items || [];

  return (
    <section
      className="section-education break-inside-avoid rounded-sm p-4 text-white"
      style={{ backgroundColor: "var(--cv-primary-1, #1E293B)" }}
    >
      <SectionTitle
        placeholder="HỌC VẤN"
        fieldName="content.sections.education.title"
        title={section.title}
        variant="light"
        isReadOnly={isReadOnly}
        renderField={renderField}
      />

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group/item relative break-inside-avoid rounded-sm p-1 hover:bg-white/10"
          >
            {!isReadOnly && actions && (
              <ItemActions
                isFirst={index === 0}
                isLast={index === items.length - 1}
                canDelete={items.length > 1}
                onMoveUp={() => actions.onMoveUp(index)}
                onMoveDown={() => actions.onMoveDown(index)}
                onAddAfter={() => actions.onAddAfter(index)}
                onDelete={() => actions.onDelete(index)}
              />
            )}

            <div className="text-[13px] font-semibold text-white">
              {renderField({
                name: `content.sections.education.items.${index}.school`,
                document: item.school,
                placeholder: "Tên trường / Học viện",
                isReadOnly,
              })}
            </div>

            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[12px] text-white/95">
              <div className="font-medium">
                {renderField({
                  name: `content.sections.education.items.${index}.title`,
                  document: item.title,
                  placeholder: "Chuyên ngành / Bằng cấp",
                  isReadOnly,
                })}
              </div>
              <div className="flex items-center gap-1 text-white/80">
                <span>(</span>
                {renderField({
                  name: `content.sections.education.items.${index}.start`,
                  document: item.start,
                  placeholder: "Bắt đầu",
                  isReadOnly,
                })}
                <span>-</span>
                {renderField({
                  name: `content.sections.education.items.${index}.end`,
                  document: item.end,
                  placeholder: "Kết thúc",
                  isReadOnly,
                })}
                <span>)</span>
              </div>
            </div>

            <div className="mt-1 text-[12px] text-white/85">
              {renderField({
                name: `content.sections.education.items.${index}.details`,
                document: item.details,
                placeholder: "Xếp loại, GPA, thành tích...",
                multiline: true,
                isReadOnly,
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

EducationSection.displayName = "EducationSection";
