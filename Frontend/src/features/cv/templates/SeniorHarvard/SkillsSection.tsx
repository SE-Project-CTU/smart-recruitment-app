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
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  section,
  primaryColor,
  isReadOnly = false,
  renderField,
  actions,
}) => {
  if (!section.visible) return null;
  const items = section.items || [];

  return (
    <section className="section-skills group relative">
      <SectionTitle
        placeholder="KỸ NĂNG"
        fieldName="content.sections.skills.title"
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="space-y-1">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group/item relative grid grid-cols-12 gap-1 rounded-sm p-0.5 hover:bg-slate-50/60"
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
            <div className="col-span-4 font-semibold text-slate-900">
              {renderField({
                name: `content.sections.skills.items.${index}.name`,
                document: item.name,
                placeholder: "Tên kỹ năng",
                isReadOnly,
              })}
            </div>
            <div className="col-span-8 text-slate-700">
              {renderField({
                name: `content.sections.skills.items.${index}.description`,
                document: item.description,
                placeholder: "Chi tiết kỹ năng, công nghệ sử dụng...",
                isReadOnly,
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
