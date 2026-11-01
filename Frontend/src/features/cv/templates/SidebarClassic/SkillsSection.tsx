import React from "react";
import type { RichTextCVItemSection, RichTextCVSkillItem } from "@/types/cv";
import ItemActions from "../../builder/components/ItemActions";
import { SidebarSectionTitle } from "./SectionTitle";
import type { CvFieldRenderer, SectionItemEditorActions } from "../types";

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
    <section className="section-skills group relative mb-4">
      <SidebarSectionTitle
        placeholder="KỸ NĂNG"
        fieldName="content.sections.skills.title"
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="px-1">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group/item relative rounded-sm p-1 hover:bg-slate-200/50 text-xs"
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
            {/* Tên kỹ năng viết hoa đậm - Không hiển thị description cho template sidebar_classic */}
            <div className="font-bold text-slate-800 tracking-wide uppercase">
              {renderField({
                name: `content.sections.skills.items.${index}.name`,
                document: item.name,
                placeholder: "KỸ NĂNG",
                isReadOnly,
              })}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-xs text-slate-400 italic py-1">
            Chưa có kỹ năng.
          </p>
        )}
      </div>
    </section>
  );
};
