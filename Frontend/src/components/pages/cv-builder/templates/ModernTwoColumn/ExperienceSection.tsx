import React from "react";
import type {
  RichTextCVExperienceItem,
  RichTextCVItemSection,
} from "@/types/cv";
import { CvDateRangeFields } from "../../components/CvDateRangeFields";
import ItemActions from "../../components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type {
  CvFieldRenderer,
  SectionItemEditorActions,
} from "../CvTemplateProps";

interface ExperienceSectionProps {
  section: RichTextCVItemSection<RichTextCVExperienceItem>;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  section,
  primaryColor,
  isReadOnly = false,
  renderField,
  actions,
}) => {
  if (!section.visible) return null;
  const items = section.items || [];

  return (
    <section className="section-experience group relative mb-3">
      <SectionTitle
        placeholder="KINH NGHIỆM LÀM VIỆC"
        fieldName="content.sections.experience.title"
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group/item relative rounded-sm p-1 hover:bg-slate-50/60"
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
            <div className="flex items-baseline justify-between gap-4">
              <div className="font-bold text-slate-900">
                {renderField({
                  name: `content.sections.experience.items.${index}.position`,
                  document: item.position,
                  placeholder: "Vị trí công việc",
                  isReadOnly,
                })}
              </div>
              <CvDateRangeFields
                startName={`content.sections.experience.items.${index}.startDate`}
                endName={`content.sections.experience.items.${index}.endDate`}
                startDate={item.startDate}
                endDate={item.endDate}
                renderField={renderField}
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="text-sm font-semibold text-slate-700">
              {renderField({
                name: `content.sections.experience.items.${index}.company`,
                document: item.company,
                placeholder: "Tên công ty",
                isReadOnly,
              })}
            </div>
            <div className="mt-1 text-slate-600">
              {renderField({
                name: `content.sections.experience.items.${index}.description`,
                document: item.description,
                placeholder: "Mô tả trách nhiệm & thành tích...",
                multiline: true,
                isReadOnly,
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
