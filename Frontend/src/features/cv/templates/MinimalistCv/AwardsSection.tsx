import React from "react";
import type { RichTextCVSections } from "@/types/cv";
import { ItemActions } from "../../builder/components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type { MinimalistCvSectionProps } from "./types";

export const AwardsSection: React.FC<
  MinimalistCvSectionProps<RichTextCVSections["awards"]>
> = React.memo(({ section, isReadOnly = false, renderField, actions }) => {
  if (section.visible === false) return null;
  const items = section.items || [];

  return (
    <section className="section-awards">
      <SectionTitle
        placeholder="GIẢI THƯỞNG"
        fieldName="content.sections.awards.title"
        title={section.title}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group/item relative flex items-baseline justify-between gap-2 break-inside-avoid rounded-sm p-1 hover:bg-slate-50/70"
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

            <div className="min-w-0 flex-1 text-[12.5px] font-medium text-slate-800">
              {renderField({
                name: `content.sections.awards.items.${index}.awardName`,
                document: item.awardName,
                placeholder: "Tên giải thưởng / Danh hiệu",
                isReadOnly,
              })}
            </div>

            <div className="shrink-0 text-[12px] text-slate-600">
              {renderField({
                name: `content.sections.awards.items.${index}.date`,
                document: item.date,
                placeholder: "Năm",
                isReadOnly,
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

AwardsSection.displayName = "AwardsSection";
