import React from "react";
import type { RichTextCVSections } from "@/types/cv";
import { ItemActions } from "../../builder/components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type { MinimalistCvSectionProps } from "./types";

export const ProjectsSection: React.FC<
  MinimalistCvSectionProps<RichTextCVSections["projects"]>
> = React.memo(({ section, isReadOnly = false, renderField, actions }) => {
  if (section.visible === false) return null;
  const items = section.items || [];

  return (
    <section className="section-projects">
      <SectionTitle
        placeholder="DỰ ÁN / HOẠT ĐỘNG"
        fieldName="content.sections.projects.title"
        title={section.title}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />

      <div className="space-y-3">
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
                name: `content.sections.projects.items.${index}.projectName`,
                document: item.projectName,
                placeholder: "Tên dự án / Hoạt động",
                isReadOnly,
              })}
            </div>

            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[12px]">
              <div className="font-medium text-slate-800">
                {renderField({
                  name: `content.sections.projects.items.${index}.role`,
                  document: item.role,
                  placeholder: "Vai trò",
                  isReadOnly,
                })}
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span>(</span>
                {renderField({
                  name: `content.sections.projects.items.${index}.start`,
                  document: item.start,
                  placeholder: "Bắt đầu",
                  isReadOnly,
                })}
                <span>-</span>
                {renderField({
                  name: `content.sections.projects.items.${index}.end`,
                  document: item.end,
                  placeholder: "Kết thúc",
                  isReadOnly,
                })}
                <span>)</span>
              </div>
            </div>

            <div className="mt-1 text-[12px] leading-relaxed text-slate-700">
              {renderField({
                name: `content.sections.projects.items.${index}.description`,
                document: item.description,
                placeholder: "Mô tả kết quả và đóng góp trong dự án...",
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

ProjectsSection.displayName = "ProjectsSection";
