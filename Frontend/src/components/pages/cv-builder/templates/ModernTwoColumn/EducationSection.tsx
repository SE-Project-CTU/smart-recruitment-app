import React from "react";
import type {
  RichTextCVEducationItem,
  RichTextCVItemSection,
} from "@/types/cv";
import { CvDateRangeFields } from "../../components/CvDateRangeFields";
import ItemActions from "../../components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type {
  CvFieldRenderer,
  SectionItemEditorActions,
} from "../CvTemplateProps";

interface EducationSectionProps {
  section: RichTextCVItemSection<RichTextCVEducationItem>;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  section,
  primaryColor,
  isReadOnly = false,
  renderField,
  actions,
}) => {
  if (!section.visible) return null;
  const items = section.items || [];

  return (
    <section className="section-education group relative mb-3">
      <SectionTitle
        placeholder="HỌC VẤN"
        fieldName="content.sections.education.title"
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="space-y-3">
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
                  name: `content.sections.education.items.${index}.school`,
                  document: item.school,
                  placeholder: "Trường / Cơ sở đào tạo",
                  isReadOnly,
                })}
              </div>
              <CvDateRangeFields
                startName={`content.sections.education.items.${index}.start`}
                endName={`content.sections.education.items.${index}.end`}
                startDate={item.start}
                endDate={item.end}
                renderField={renderField}
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="text-sm font-semibold text-slate-700">
              {renderField({
                name: `content.sections.education.items.${index}.title`,
                document: item.title,
                placeholder: "Ngành học / Bằng cấp",
                isReadOnly,
              })}
            </div>
            <div className="mt-1 text-slate-600">
              {renderField({
                name: `content.sections.education.items.${index}.details`,
                document: item.details,
                placeholder: "Mô tả GPA, thành tích học tập...",
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
