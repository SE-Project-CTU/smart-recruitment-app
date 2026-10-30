import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type {
  RichTextCVEducationItem,
  RichTextCVItemSection,
} from "@/types/cv";
import type { RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";
import { createEmptyTiptapDocument } from "@/features/cv-builder/utils/tiptapJson";
import { TiptapField } from "../../components/TiptapField";
import { CvDateRangeFields } from "../../components/CvDateRangeFields";
import ItemActions from "../../components/ItemActions";
import { SectionTitle } from "./SectionTitle";

interface Props {
  section: RichTextCVItemSection<RichTextCVEducationItem>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const EducationSection: React.FC<Props> = ({
  section,
  primaryColor,
  isReadOnly = false,
}) => {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const { fields, insert, move, remove } = useFieldArray({
    control,
    name: "content.sections.education.items",
    keyName: "_fieldKey",
  });
  if (!section.visible) return null;
  const add = (index: number) =>
    insert(index + 1, {
      id: `edu_${crypto.randomUUID()}`,
      school: createEmptyTiptapDocument(),
      title: createEmptyTiptapDocument(),
      start: createEmptyTiptapDocument(),
      end: createEmptyTiptapDocument(),
      details: createEmptyTiptapDocument(),
    });
  return (
    <section className="section-education group relative mb-3">
      <SectionTitle
        placeholder="HỌC VẤN"
        formFieldName="content.sections.education.title"
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
      />
      <div className="space-y-3">
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
                name={`content.sections.education.items.${index}.school`}
                placeholder="Tên trường học"
                isReadOnly={isReadOnly}
                className="flex-1"
              />
              <CvDateRangeFields
                startName={`content.sections.education.items.${index}.start`}
                endName={`content.sections.education.items.${index}.end`}
                yearOnly
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="mt-0.5 font-medium text-slate-800">
              <TiptapField
                name={`content.sections.education.items.${index}.title`}
                placeholder="Chuyên ngành / Bằng cấp"
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="mt-0.5 text-slate-600">
              <TiptapField
                name={`content.sections.education.items.${index}.details`}
                placeholder="Xếp loại / Thông tin chi tiết..."
                isReadOnly={isReadOnly}
              />
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="cv-text-meta py-1 text-center text-slate-400 italic">
            Chưa có thông tin học vấn.
          </p>
        )}
      </div>
    </section>
  );
};
