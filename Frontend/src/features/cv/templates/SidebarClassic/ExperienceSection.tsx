import React from "react";
import type { RichTextCVItemSection, RichTextCVExperienceItem } from "@/types/cv";
import ItemActions from "../../builder/components/ItemActions";
import { MainSectionTitle } from "./SectionTitle";
import type { CvFieldRenderer, SectionItemEditorActions } from "../types";

interface ExperienceSectionProps {
  section: RichTextCVItemSection<RichTextCVExperienceItem>;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const ExperienceSection = React.memo<ExperienceSectionProps>(({
  section,
  primaryColor,
  isReadOnly = false,
  renderField,
  actions,
}) => {
  if (!section.visible) return null;
  const items = section.items || [];

  return (
    <section className="section-experience group relative mb-5">
      <MainSectionTitle
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
            
            {/* Dòng 1: Tên công ty (ĐẬM) + Khoảng thời gian bên phải (ĐẬM) */}
            <div className="flex items-start justify-between gap-3 text-slate-900 font-bold">
              <div className="flex-1 min-w-0 text-[13px]">
                {renderField({
                  name: `content.sections.experience.items.${index}.company`,
                  document: item.company,
                  placeholder: "Tên công ty / Doanh nghiệp",
                  isReadOnly,
                })}
              </div>
              <div className="text-[12px] font-bold text-slate-900 shrink-0 flex gap-1 items-center">
                {renderField({
                  name: `content.sections.experience.items.${index}.startDate`,
                  document: item.startDate,
                  placeholder: "08/2019",
                  isReadOnly,
                })}
                <span>-</span>
                {renderField({
                  name: `content.sections.experience.items.${index}.endDate`,
                  document: item.endDate,
                  placeholder: "Nay",
                  isReadOnly,
                })}
              </div>
            </div>

            {/* Dòng 2: Chức vụ / Vị trí viết hoa in hoa nhẹ */}
            <div className="font-semibold text-slate-800 uppercase tracking-wide text-[12px] mt-1">
              {renderField({
                name: `content.sections.experience.items.${index}.position`,
                document: item.position,
                placeholder: "CHUYÊN VIÊN CONTENT MARKETING",
                isReadOnly,
              })}
            </div>

            {/* Dòng 3: Mô tả bullet points */}
            <div className="text-slate-700 mt-1.5 leading-relaxed">
              {renderField({
                name: `content.sections.experience.items.${index}.description`,
                document: item.description,
                placeholder: "• Liệt kê các công việc, trách nhiệm và thành tích...",
                multiline: true,
                isReadOnly,
              })}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-xs text-slate-400 italic py-1">
            Chưa có kinh nghiệm làm việc.
          </p>
        )}
      </div>
    </section>
  );
});

ExperienceSection.displayName = "ExperienceSection";
