import React from "react";
import type { RichTextCVSections } from "@/types/cv";
import { extractTiptapPlainText } from "../../builder/utils/tiptapJson";
import { ItemActions } from "../../builder/components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type { MinimalistCvSectionProps } from "./types";

/**
 * SkillsSection:
 * Danh sách kỹ năng tối giản dạng từng dòng văn bản rõ ràng theo mockup Minimalist CV.
 */
export const SkillsSection: React.FC<
  MinimalistCvSectionProps<RichTextCVSections["skills"]>
> = React.memo(({ section, isReadOnly = false, renderField, actions }) => {
  if (section.visible === false) return null;
  const items = section.items || [];

  return (
    <section className="section-skills">
      <SectionTitle
        placeholder="KỸ NĂNG"
        fieldName="content.sections.skills.title"
        title={section.title}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />

      <div className="space-y-2">
        {items.map((item, index) => {
          const hasDescription = Boolean(
            item.description &&
              extractTiptapPlainText(item.description).trim(),
          );
          return (
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

              <div className="text-[12.5px] font-medium text-slate-800">
                {renderField({
                  name: `content.sections.skills.items.${index}.name`,
                  document: item.name,
                  placeholder: "Kỹ năng chuyên môn",
                  isReadOnly,
                })}
              </div>

              {(hasDescription || !isReadOnly) && (
                <div className="mt-0.5 text-[11.5px] text-slate-600">
                  {renderField({
                    name: `content.sections.skills.items.${index}.description`,
                    document: item.description,
                    placeholder: "Mô tả thêm (tùy chọn)",
                    isReadOnly,
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
});

SkillsSection.displayName = "SkillsSection";
