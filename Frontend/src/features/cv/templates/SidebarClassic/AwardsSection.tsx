import React from "react";
import type {
  RichTextCVAwardItem,
  RichTextCVItemSection,
} from "@/types/cv";
import ItemActions from "../../builder/components/ItemActions";
import { MainSectionTitle } from "./SectionTitle";
import type { CvFieldRenderer, SectionItemEditorActions } from "../types";

interface AwardsSectionProps {
  section: RichTextCVItemSection<RichTextCVAwardItem>;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const AwardsSection = React.memo<AwardsSectionProps>(({
  section,
  primaryColor = "#262626",
  isReadOnly = false,
  renderField,
  actions,
}) => {
  if (!section.visible) return null;
  const items = section.items || [];

  return (
    <section className="section-awards group relative mb-5">
      <MainSectionTitle
        placeholder="DANH HIỆU VÀ GIẢI THƯỞNG"
        fieldName="content.sections.awards.title"
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group/item relative rounded-sm py-0.5 pl-6 pr-1 hover:bg-slate-50 text-xs before:absolute before:left-[3px] before:top-1.5 before:h-2 before:w-2 before:rounded-full before:bg-slate-900 before:z-10 after:absolute after:left-[6.5px] after:top-1.5 after:bottom-0 after:w-[1px] after:bg-slate-700"
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

            {/* Dòng 1: Năm / Thời gian (ĐẬM) */}
            <div className="font-bold text-slate-900 text-[12px]">
              {renderField({
                name: `content.sections.awards.items.${index}.date`,
                document: item.date,
                placeholder: "2024",
                isReadOnly,
              })}
            </div>

            {/* Dòng 2: Tên giải thưởng */}
            <div className="font-medium text-slate-800 text-[12px] mt-0.5">
              {renderField({
                name: `content.sections.awards.items.${index}.awardName`,
                document: item.awardName,
                placeholder: "Tên giải thưởng / danh hiệu",
                isReadOnly,
              })}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-xs text-slate-400 italic py-1">
            Chưa có giải thưởng.
          </p>
        )}
      </div>
    </section>
  );
});

AwardsSection.displayName = "AwardsSection";
