import React from "react";
import type { RichTextCVSections } from "@/types/cv";
import { ItemActions } from "../../builder/components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type { MinimalistCvSectionProps } from "./types";

/**
 * ExperienceSection:
 * Hiển thị kinh nghiệm làm việc theo phong cách Minimalist:
 * Tên công ty in đậm, chức danh + mốc thời gian, tiếp theo là danh sách mô tả.
 */
export const ExperienceSection: React.FC<
  MinimalistCvSectionProps<RichTextCVSections["experience"]>
> = React.memo(({ section, isReadOnly = false, renderField, actions }) => {
  if (section.visible === false) return null;
  const items = section.items || [];

  return (
    <section className="section-experience">
      <SectionTitle
        placeholder="KINH NGHIỆM LÀM VIỆC"
        fieldName="content.sections.experience.title"
        title={section.title}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group/item relative break-inside-avoid rounded-sm p-1 hover:bg-slate-50/70"
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

            <div className="text-[13px] font-semibold text-slate-900">
              {renderField({
                name: `content.sections.experience.items.${index}.company`,
                document: item.company,
                placeholder: "Tên công ty / Doanh nghiệp",
                isReadOnly,
              })}
            </div>

            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[12.5px]">
              <div className="font-semibold text-slate-800">
                {renderField({
                  name: `content.sections.experience.items.${index}.position`,
                  document: item.position,
                  placeholder: "Vị trí / Chức danh",
                  isReadOnly,
                })}
              </div>
              <div className="flex items-center gap-1 text-[12px] text-slate-600">
                <span>(</span>
                {renderField({
                  name: `content.sections.experience.items.${index}.startDate`,
                  document: item.startDate,
                  placeholder: "Bắt đầu",
                  isReadOnly,
                })}
                <span>-</span>
                {renderField({
                  name: `content.sections.experience.items.${index}.endDate`,
                  document: item.endDate,
                  placeholder: "Hiện tại",
                  isReadOnly,
                })}
                <span>)</span>
              </div>
            </div>

            <div className="mt-1.5 text-[12px] leading-relaxed text-slate-700">
              {renderField({
                name: `content.sections.experience.items.${index}.description`,
                document: item.description,
                placeholder: "Mô tả công việc và kết quả đạt được...",
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

ExperienceSection.displayName = "ExperienceSection";
