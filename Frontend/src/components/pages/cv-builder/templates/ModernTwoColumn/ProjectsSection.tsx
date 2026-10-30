import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { RichTextCVItemSection, RichTextCVProjectItem } from "@/types/cv";
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
  section: RichTextCVItemSection<RichTextCVProjectItem>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const ProjectsSection: React.FC<Props> = ({
  section,
  primaryColor,
  isReadOnly = false,
}) => {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const { fields, insert, move, remove } = useFieldArray({
    control,
    name: "content.sections.projects.items",
    keyName: "_fieldKey",
  });
  if (!section.visible) return null;
  const add = (index: number) =>
    insert(index + 1, {
      id: `prj_${crypto.randomUUID()}`,
      projectName: createEmptyTiptapDocument(),
      role: createEmptyTiptapDocument(),
      start: createEmptyTiptapDocument(),
      end: createEmptyTiptapDocument(),
      description: createBulletListDocument(),
    });
  return (
    <section className="section-projects group relative mb-3">
      <SectionTitle
        placeholder="DỰ ÁN NỔI BẬT"
        formFieldName="content.sections.projects.title"
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
                name={`content.sections.projects.items.${index}.projectName`}
                placeholder="Tên dự án"
                isReadOnly={isReadOnly}
                className="flex-1"
              />
              <CvDateRangeFields
                startName={`content.sections.projects.items.${index}.start`}
                endName={`content.sections.projects.items.${index}.end`}
                endPlaceholder="Hiện tại"
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="mt-0.5 font-medium text-slate-800">
              <TiptapField
                name={`content.sections.projects.items.${index}.role`}
                placeholder="Vai trò trong dự án"
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="mt-1 min-h-5 text-slate-700">
              <TiptapField
                name={`content.sections.projects.items.${index}.description`}
                placeholder="Mô tả công nghệ, đóng góp và kết quả..."
                multiline
                isReadOnly={isReadOnly}
              />
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="cv-text-meta py-1 text-center text-slate-400 italic">
            Chưa có dự án nào.
          </p>
        )}
      </div>
    </section>
  );
};
