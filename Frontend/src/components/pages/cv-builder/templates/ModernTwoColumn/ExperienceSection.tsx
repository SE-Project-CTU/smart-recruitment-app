import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type {
  RichTextCVExperienceItem,
  RichTextCVItemSection,
} from "@/types/cv";
import type { RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";
import {
  createEmptyTiptapDocument,
  createBulletListDocument,
} from "@/features/cv-builder/utils/tiptapJson";
import { TiptapField } from "../../components/TiptapField";
import { CvDateRangeFields } from "../../components/CvDateRangeFields";
import ItemActions from "../../components/ItemActions";
import { SectionTitle } from "./SectionTitle";

interface Props {
  section: RichTextCVItemSection<RichTextCVExperienceItem>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const ExperienceSection: React.FC<Props> = ({
  section,
  primaryColor,
  isReadOnly = false,
}) => {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const { fields, insert, move, remove } = useFieldArray({
    control,
    name: "content.sections.experience.items",
    keyName: "_fieldKey",
  });
  if (!section.visible) return null;
  const add = (index: number) =>
    insert(index + 1, {
      id: `exp_${crypto.randomUUID()}`,
      company: createEmptyTiptapDocument(),
      position: createEmptyTiptapDocument(),
      startDate: createEmptyTiptapDocument(),
      endDate: createEmptyTiptapDocument(),
      description: createBulletListDocument(),
    });
  return (
    <section className="section-experience group relative mb-3">
      <SectionTitle
        placeholder="KINH NGHIỆM LÀM VIỆC"
        formFieldName="content.sections.experience.title"
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
      />
      <div className="space-y-4">
        {fields.map((item, index) => (
          <div
            key={item._fieldKey}
            className="group/item relative rounded-sm p-1 hover:bg-slate-50/60"
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
            <div className="flex items-center justify-between gap-2 font-bold text-slate-900">
              <TiptapField
                name={`content.sections.experience.items.${index}.company`}
                placeholder="Tên công ty"
                isReadOnly={isReadOnly}
                className="flex-1"
              />
              <CvDateRangeFields
                startName={`content.sections.experience.items.${index}.startDate`}
                endName={`content.sections.experience.items.${index}.endDate`}
                endPlaceholder="Hiện tại"
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="mt-0.5 font-semibold text-slate-800">
              <TiptapField
                name={`content.sections.experience.items.${index}.position`}
                placeholder="Vị trí / Chức danh"
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="mt-1.5 min-h-5 text-slate-700">
              <TiptapField
                name={`content.sections.experience.items.${index}.description`}
                placeholder="Mô tả trách nhiệm và thành tích đạt được..."
                multiline
                isReadOnly={isReadOnly}
              />
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="cv-text-meta py-1 text-center text-slate-400 italic">
            Chưa có kinh nghiệm làm việc nào.
          </p>
        )}
      </div>
    </section>
  );
};
