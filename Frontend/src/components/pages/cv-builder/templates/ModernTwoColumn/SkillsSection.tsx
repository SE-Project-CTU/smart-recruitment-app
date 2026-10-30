import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { RichTextCVItemSection, RichTextCVSkillItem } from "@/types/cv";
import type { RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";
import { createEmptyTiptapDocument } from "@/features/cv-builder/utils/tiptapJson";
import { TiptapField } from "../../components/TiptapField";
import ItemActions from "../../components/ItemActions";
import { SectionTitle } from "./SectionTitle";

interface Props {
  section: RichTextCVItemSection<RichTextCVSkillItem>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const SkillsSection: React.FC<Props> = ({
  section,
  primaryColor,
  isReadOnly = false,
}) => {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const { fields, insert, move, remove } = useFieldArray({
    control,
    name: "content.sections.skills.items",
    keyName: "_fieldKey",
  });
  if (!section.visible) return null;
  const add = (index: number) =>
    insert(index + 1, {
      id: `sk_${crypto.randomUUID()}`,
      name: createEmptyTiptapDocument(),
      description: createEmptyTiptapDocument(),
    });
  return (
    <section className="section-skills group relative">
      <SectionTitle
        placeholder="KỸ NĂNG"
        formFieldName="content.sections.skills.title"
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
      />
      <div className="space-y-1">
        {fields.map((item, index) => (
          <div
            key={item._fieldKey}
            className="group/item relative grid grid-cols-12 gap-1 rounded-sm p-0.5 hover:bg-slate-50/60"
          >
            {!isReadOnly && (
              <ItemActions
                isFirst={index === 0}
                isLast={index === fields.length - 1}
                canDelete={fields.length > 1}
                onMoveUp={() => move(index, index - 1)}
                onMoveDown={() => move(index, index + 1)}
                onAddAfter={() => add(index)}
                onDelete={() => remove(index)}
              />
            )}
            <div className="col-span-4 font-semibold text-slate-900">
              <TiptapField
                name={`content.sections.skills.items.${index}.name`}
                placeholder="Tên kỹ năng"
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="col-span-8 text-justify text-slate-700">
              <TiptapField
                name={`content.sections.skills.items.${index}.description`}
                placeholder="Mô tả kỹ năng..."
                multiline
                isReadOnly={isReadOnly}
              />
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="cv-text-meta py-1 text-center text-slate-400 italic">
            Chưa có kỹ năng nào.
          </p>
        )}
      </div>
    </section>
  );
};
