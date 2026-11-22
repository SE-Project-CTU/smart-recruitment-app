import React from "react";
import type {
  RichTextCVAwardItem,
  RichTextCVItemSection,
} from "@/types/cv";
import ItemActions from "../../builder/components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type {
  CvFieldRenderer,
  SectionItemEditorActions,
} from "../types";

export interface AwardsSectionProps {
  section: RichTextCVItemSection<RichTextCVAwardItem>;
  primaryColor?: string;
  bannerBgColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const AwardsSection: React.FC<AwardsSectionProps> = React.memo(({
  section,
  primaryColor,
  bannerBgColor,
  isReadOnly = false,
  renderField,
  actions,
}) => {
  if (section.visible === false) return null;
  const items = section.items || [];

  return (
    <section className="section-awards group relative mb-3">
      <SectionTitle
        placeholder="GIẢI THƯỞNG"
        fieldName="content.sections.awards.title"
        title={section.title}
        primaryColor={primaryColor}
        bannerBgColor={bannerBgColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group/item relative flex items-center justify-between gap-2 rounded-sm p-1 hover:bg-slate-50/60 break-inside-avoid"
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
            <div className="flex-1 font-medium text-slate-800">
              {renderField({
                name: `content.sections.awards.items.${index}.awardName`,
                document: item.awardName,
                placeholder: "Tên giải thưởng / học bổng",
                isReadOnly,
              })}
            </div>
            <div className="text-slate-500 text-sm">
              {renderField({
                name: `content.sections.awards.items.${index}.date`,
                document: item.date,
                placeholder: "Thời gian",
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
