import React from "react";
import type {
  RichTextCVExperienceItem,
  RichTextCVItemSection,
} from "@/types/cv";
import { CvDateRangeFields } from "../../builder/components/CvDateRangeFields";
import ItemActions from "../../builder/components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type {
  CvFieldRenderer,
  SectionItemEditorActions,
} from "../types";

interface ExperienceSectionProps {
  section: RichTextCVItemSection<RichTextCVExperienceItem>;
  primaryColor?: string;
  bannerBgColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = React.memo(({
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
    <section className="section-experience group relative mb-3">
      <SectionTitle
        placeholder="KINH NGHIỆM LÀM VIỆC"
        fieldName="content.sections.experience.title"
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
                startName={`content.sections.experience.items.${index}.startDate`}
                endName={`content.sections.experience.items.${index}.endDate`}
                startDate={item.startDate}
                endDate={item.endDate}
                renderField={renderField}
                isReadOnly={isReadOnly}
              />
            </div>
            {/* Cột phải 80%: Công ty, Vị trí & Mô tả */}
            <div className="col-span-9 space-y-0.5">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900">
                  {renderField({
                    name: `content.sections.experience.items.${index}.company`,
                    document: item.company,
                    placeholder: "Tên công ty",
                    isReadOnly,
                  })}
                </span>
                <span className="text-slate-400">|</span>
                <span className="font-semibold text-slate-700">
                  {renderField({
                    name: `content.sections.experience.items.${index}.position`,
                    document: item.position,
                    placeholder: "Vị trí công việc",
                    isReadOnly,
                  })}
                </span>
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
          </div>
        ))}
      </div>
    </section>
  );
});

ExperienceSection.displayName = "ExperienceSection";
