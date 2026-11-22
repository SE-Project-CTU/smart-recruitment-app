import React from "react";
import type { RichTextCVItemSection, RichTextCVProjectItem } from "@/types/cv";
import { CvDateRangeFields } from "../../builder/components/CvDateRangeFields";
import ItemActions from "../../builder/components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type {
  CvFieldRenderer,
  SectionItemEditorActions,
} from "../types";

interface ProjectsSectionProps {
  section: RichTextCVItemSection<RichTextCVProjectItem>;
  primaryColor?: string;
  bannerBgColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = React.memo(({
  section,
  primaryColor,
  bannerBgColor,
  isReadOnly = false,
  renderField,
  actions,
}) => {
  if (!section.visible) return null;
  const items = section.items || [];

  return (
    <section className="section-projects group relative mb-3">
      <SectionTitle
        placeholder="HOẠT ĐỘNG DỰ ÁN"
        fieldName="content.sections.projects.title"
        title={section.title}
        primaryColor={primaryColor}
        bannerBgColor={bannerBgColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group/item relative grid grid-cols-12 gap-4 rounded-sm p-1 hover:bg-slate-50/60 break-inside-avoid"
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
            {/* Cột trái 20%: Thời gian */}
            <div className="col-span-3 text-slate-600 font-medium pt-0.5">
              <CvDateRangeFields
                startName={`content.sections.projects.items.${index}.start`}
                endName={`content.sections.projects.items.${index}.end`}
                startDate={item.start}
                endDate={item.end}
                renderField={renderField}
                isReadOnly={isReadOnly}
              />
            </div>
            {/* Cột phải 80%: Tổ chức/Dự án & Vai trò, Mô tả */}
            <div className="col-span-9 space-y-0.5">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900">
                  {renderField({
                    name: `content.sections.projects.items.${index}.projectName`,
                    document: item.projectName,
                    placeholder: "Tên dự án / Tổ chức",
                    isReadOnly,
                  })}
                </span>
                <span className="text-slate-400">|</span>
                <span className="font-semibold text-slate-700">
                  {renderField({
                    name: `content.sections.projects.items.${index}.role`,
                    document: item.role,
                    placeholder: "Vai trò / Vị trí",
                    isReadOnly,
                  })}
                </span>
              </div>
              <div className="mt-1 text-slate-600">
                {renderField({
                  name: `content.sections.projects.items.${index}.description`,
                  document: item.description,
                  placeholder: "Mô tả hoạt động, đóng góp & kết quả...",
                  multiline: true,
                  isReadOnly,
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

ProjectsSection.displayName = "ProjectsSection";
