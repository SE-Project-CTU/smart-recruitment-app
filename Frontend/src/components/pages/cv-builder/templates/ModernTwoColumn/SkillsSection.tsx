import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVItemSection, CVSkillItem, CVFieldStyle } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import { getFieldStyle } from "./utils";
import { EditableField } from "../../components/EditableField";
import ItemActions from "../../components/item-actions";
import type { CvEditorValues } from "@/features/cv-builder/schema/cvSchema";
import { useCvMutations } from "@/features/cv-builder/hooks/useCvMutations";

interface SkillsSectionProps {
  section: CVItemSection<CVSkillItem>;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  section,
  fields,
  primaryColor,
  isReadOnly = false,
}) => {
  const { control } = useFormContext<CvEditorValues>();
  const {
    fields: formItems,
    insert,
    move,
    remove,
  } = useFieldArray({
    control,
    name: "content.sections.skills.items",
    keyName: "_fieldKey",
  });

  const { cleanupItemStyles } = useCvMutations();

  if (!section.visible) return null;

  const handleAddAfter = (index: number) => {
    insert(index + 1, {
      id: `sk_${Date.now()}`,
      name: "Tên kỹ năng",
      description: "Mô tả mức độ thành thạo hoặc kinh nghiệm ứng dụng...",
    });
  };

  const handleRemoveItem = (index: number, itemId: string) => {
    cleanupItemStyles(itemId);
    remove(index);
  };

  return (
    <div className="section-skills group relative">
      <SectionTitle
        title={section.title || "KỸ NĂNG"}
        fieldKey="sections.skills.title"
        formFieldName="content.sections.skills.title"
        fields={fields}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
      />

      <div className="text-xs">
        {formItems.map((item, index) => (
          <div key={item._fieldKey} className="group/item relative grid grid-cols-12 gap-1 p-0.5 rounded-sm transition-all hover:bg-slate-50/60">
            {/* Item Actions bên phải */}
            {!isReadOnly && (
              <ItemActions
                isFirst={index === 0}
                isLast={index === formItems.length - 1}
                onMoveUp={() => move(index, index - 1)}
                onMoveDown={() => move(index, index + 1)}
                onAddAfter={() => handleAddAfter(index)}
                onDelete={() => handleRemoveItem(index, item.id)}
              />
            )}

            {/* Cột trái: Tên kỹ năng */}
            <div
              className="col-span-4 font-semibold text-slate-900"
              style={getFieldStyle(fields, `${item.id}.name`, {
                fontWeight: "600",
                color: "#0F172A",
              })}
            >
              <EditableField
                name={`content.sections.skills.items.${index}.name`}
                placeholder="Tên kỹ năng"
                isReadOnly={isReadOnly}
              />
            </div>

            {/* Cột phải: Mô tả */}
            <div
              className="col-span-8 text-slate-700 leading-relaxed text-justify"
              style={getFieldStyle(fields, `${item.id}.description`, {
                color: "#334155",
              })}
            >
              <EditableField
                name={`content.sections.skills.items.${index}.description`}
                placeholder="Mô tả kỹ năng..."
                multiline
                isReadOnly={isReadOnly}
                className="w-full block"
              />
            </div>
          </div>
        ))}

        {formItems.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-1 italic">
            Chưa có kỹ năng nào.
          </p>
        )}
      </div>
    </div>
  );
};
