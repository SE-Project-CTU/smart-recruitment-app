import React from "react";
import type { RichTextCVItemSection, RichTextCVProjectItem } from "@/types/cv";
import ItemActions from "../../builder/components/ItemActions";
import { MainSectionTitle } from "./SectionTitle";
import type { CvFieldRenderer, SectionItemEditorActions } from "../types";

interface ProjectsSectionProps {
  section: RichTextCVItemSection<RichTextCVProjectItem>;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const ProjectsSection = React.memo<ProjectsSectionProps>(({
  section,
  primaryColor,
  isReadOnly = false,
  renderField,
  actions,
}) => {
  if (!section.visible) return null;
  const items = section.items || [];

  return (
    <section className="section-projects group relative mb-5">
      <MainSectionTitle
        placeholder="HOẠT ĐỘNG"
        fieldName="content.sections.projects.title"
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="space-y-4">
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
            
            {/* Dòng 1: Tên CLB / Dự án (ĐẬM) + Năm bên phải (ĐẬM) */}
            <div className="flex items-start justify-between gap-3 text-slate-900 font-bold">
              <div className="flex-1 min-w-0 text-[13px]">
                {renderField({
                  name: `content.sections.projects.items.${index}.projectName`,
                  document: item.projectName,
                  placeholder: "Tên hoạt động / CLB / Dự án",
                  isReadOnly,
                })}
              </div>
              <div className="text-[12px] font-bold text-slate-900 shrink-0 flex gap-1 items-center">
                {renderField({
                  name: `content.sections.projects.items.${index}.start`,
                  document: item.start,
                  placeholder: "2016",
                  isReadOnly,
                })}
                <span>-</span>
                {renderField({
                  name: `content.sections.projects.items.${index}.end`,
                  document: item.end,
                  placeholder: "2018",
                  isReadOnly,
                })}
              </div>
            </div>

            {/* Dòng 2: Vai trò */}
            <div className="font-medium text-slate-700 text-[12px] mt-1">
              {renderField({
                name: `content.sections.projects.items.${index}.role`,
                document: item.role,
                placeholder: "Thành viên Ban Chuyên môn / Trưởng ban...",
                isReadOnly,
              })}
            </div>

            {/* Dòng 3: Mô tả bullet points */}
            <div className="text-slate-600 mt-1.5 leading-relaxed">
              {renderField({
                name: `content.sections.projects.items.${index}.description`,
                document: item.description,
                placeholder: "• Mô tả hoạt động và kết quả đạt được...",
                multiline: true,
                isReadOnly,
              })}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-xs text-slate-400 italic py-1">
            Chưa có thông tin hoạt động / dự án.
          </p>
        )}
      </div>
    </section>
  );
});

ProjectsSection.displayName = "ProjectsSection";
