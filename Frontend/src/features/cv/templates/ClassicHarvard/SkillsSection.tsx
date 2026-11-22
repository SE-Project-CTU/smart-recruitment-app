import React from "react";
import type { RichTextCVItemSection, RichTextCVSkillItem } from "@/types/cv";
import ItemActions from "../../builder/components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type {
  CvFieldRenderer,
  SectionItemEditorActions,
} from "../types";

interface SkillsSectionProps {
  section: RichTextCVItemSection<RichTextCVSkillItem>;
  primaryColor?: string;
  bannerBgColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const SkillsSection: React.FC<SkillsSectionProps> = React.memo(({
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
    <section className="section-skills group relative mb-3">
      <SectionTitle
        placeholder="KỸ NĂNG"
        fieldName="content.sections.skills.title"
        title={section.title}
        primaryColor={primaryColor}
        bannerBgColor={bannerBgColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      {/* Hiển thị lưới 2 cột theo phong cách mockup */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group/item relative rounded-sm p-1 hover:bg-slate-50/60 break-inside-avoid"
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
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900">
                {renderField({
                  name: `content.sections.skills.items.${index}.name`,
                  document: item.name,
                  placeholder: "Nhóm kỹ năng",
                  isReadOnly,
                })}
              </div>
              <div className="text-slate-600">
                {renderField({
                  name: `content.sections.skills.items.${index}.description`,
                  document: item.description,
                  placeholder: "Chi tiết các kỹ năng...",
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

SkillsSection.displayName = "SkillsSection";
