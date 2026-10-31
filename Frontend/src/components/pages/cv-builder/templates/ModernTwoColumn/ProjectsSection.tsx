import React from "react";
import type { RichTextCVItemSection, RichTextCVProjectItem } from "@/types/cv";
import { CvDateRangeFields } from "../../components/CvDateRangeFields";
import ItemActions from "../../components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type {
  CvFieldRenderer,
  SectionItemEditorActions,
} from "../CvTemplateProps";

interface ProjectsSectionProps {
  section: RichTextCVItemSection<RichTextCVProjectItem>;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  section,
  primaryColor,
  isReadOnly = false,
  renderField,
  actions,
}) => {
  if (!section.visible) return null;
  const items = section.items || [];

  return (
    <section className="section-projects group relative mb-3">
      <SectionTitle
        placeholder="DỰ ÁN NỔI BẬT"
        fieldName="content.sections.projects.title"
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
                  name: `content.sections.projects.items.${index}.projectName`,
                  document: item.projectName,
                  placeholder: "Tên dự án",
                  isReadOnly,
                })}
              </div>
              <CvDateRangeFields
                startName={`content.sections.projects.items.${index}.start`}
                endName={`content.sections.projects.items.${index}.end`}
                startDate={item.start}
                endDate={item.end}
                renderField={renderField}
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="font-semibold text-slate-700">
              {renderField({
                name: `content.sections.projects.items.${index}.role`,
                document: item.role,
                placeholder: "Vai trò trong dự án",
                isReadOnly,
              })}
            </div>
            <div className="mt-1 text-slate-600">
              {renderField({
                name: `content.sections.projects.items.${index}.description`,
                document: item.description,
                placeholder: "Mô tả công nghệ, quy mô, kết quả đạt được...",
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
