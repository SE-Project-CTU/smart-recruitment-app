import React from "react";
import type { RichTextCVItemSection, RichTextCVEducationItem } from "@/types/cv";
import ItemActions from "../../builder/components/ItemActions";
import { SidebarSectionTitle } from "./SectionTitle";
import type { CvFieldRenderer, SectionItemEditorActions } from "../types";

interface EducationSectionProps {
  section: RichTextCVItemSection<RichTextCVEducationItem>;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const EducationSection = React.memo<EducationSectionProps>(({
  section,
  primaryColor,
  isReadOnly = false,
  renderField,
  actions,
}) => {
  if (!section.visible) return null;
  const items = section.items || [];

  return (
    <section className="section-education group relative mb-4">
      <SidebarSectionTitle
        placeholder="HỌC VẤN"
        fieldName="content.sections.education.title"
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group/item relative rounded-sm py-0.5 pl-5 pr-1 hover:bg-slate-200/50 text-xs before:absolute before:left-[1px] before:top-1.5 before:h-2 before:w-2 before:rounded-full before:bg-slate-900 before:z-10 after:absolute after:left-[4.5px] after:top-1.5 after:bottom-0 after:w-[1px] after:bg-slate-700"
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

            {/* Dòng 1: Tên trường + Khoảng thời gian bên phải */}
            <div className="flex items-start justify-between gap-1 font-bold text-slate-900">
              <div className="flex-1 min-w-0 text-[12px]">
                {renderField({
                  name: `content.sections.education.items.${index}.school`,
                  document: item.school,
                  placeholder: "Đại học / Cơ sở đào tạo",
                  isReadOnly,
                })}
              </div>
              <div className="text-[11px] font-semibold text-slate-800 shrink-0 flex gap-0.5">
                {renderField({
                  name: `content.sections.education.items.${index}.start`,
                  document: item.start,
                  placeholder: "2015",
                  isReadOnly,
                })}
                <span>-</span>
                {renderField({
                  name: `content.sections.education.items.${index}.end`,
                  document: item.end,
                  placeholder: "2019",
                  isReadOnly,
                })}
              </div>
            </div>

            {/* Dòng 2: Ngành học / Bằng cấp */}
            <div className="font-medium text-slate-700 text-[11px] mt-0.5">
              {renderField({
                name: `content.sections.education.items.${index}.title`,
                document: item.title,
                placeholder: "Chuyên ngành / Bằng cấp",
                isReadOnly,
              })}
            </div>

            {/* Dòng 3: Chi tiết / Xếp loại */}
            <div className="text-slate-600 mt-0.5 leading-relaxed text-[11px]">
              {renderField({
                name: `content.sections.education.items.${index}.details`,
                document: item.details,
                placeholder: "Xếp loại, GPA...",
                multiline: true,
                isReadOnly,
              })}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-xs text-slate-400 italic py-1">
            Chưa có thông tin học vấn.
          </p>
        )}
      </div>
    </section>
  );
});

EducationSection.displayName = "EducationSection";
