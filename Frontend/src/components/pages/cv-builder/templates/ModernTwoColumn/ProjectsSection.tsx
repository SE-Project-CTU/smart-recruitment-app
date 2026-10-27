import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVItemSection, CVProjectItem, CVFieldStyle } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import { getFieldStyle } from "./utils";
import { EditableField } from "../../components/EditableField";
import ItemActions from "../../components/item-actions";
import type { CvEditorValues } from "@/features/cv-builder/schema/cvSchema";
import { useCvMutations } from "@/features/cv-builder/hooks/useCvMutations";

interface ProjectsSectionProps {
  section: CVItemSection<CVProjectItem>;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
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
    name: "content.sections.projects.items",
    keyName: "_fieldKey",
  });

  const { cleanupItemStyles } = useCvMutations();

  if (!section.visible) return null;

  const handleAddAfter = (index: number) => {
    insert(index + 1, {
      id: `prj_${Date.now()}`,
      projectName: "Tên dự án nổi bật",
      role: "Vai trò / Vị trí đảm nhiệm",
      start: "2026-01",
      end: null,
      description: "• Mô tả mục tiêu và quy mô dự án...\n• Công nghệ sử dụng và kết quả đạt được...",
    });
  };

  const handleRemoveItem = (index: number, itemId: string) => {
    cleanupItemStyles(itemId);
    remove(index);
  };

  return (
    <div className="section-projects mb-3 group relative">
      <SectionTitle
        title={section.title || "DỰ ÁN NỔI BẬT"}
        fieldKey="sections.projects.title"
        formFieldName="content.sections.projects.title"
        fields={fields}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
      />

      <div className="space-y-3">
        {formItems.map((item, index) => (
          <div key={item._fieldKey} className="group/item relative text-xs rounded-sm p-1 transition-all hover:bg-slate-50/60">
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

            {/* Tên dự án & Thời gian */}
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span
                style={getFieldStyle(fields, `${item.id}.projectName`, {
                  fontWeight: "bold",
                })}
              >
                <EditableField
                  name={`content.sections.projects.items.${index}.projectName`}
                  placeholder="Tên dự án"
                  isReadOnly={isReadOnly}
                />
              </span>

              <div className="flex items-center gap-1 font-normal text-slate-600">
                <EditableField
                  name={`content.sections.projects.items.${index}.start`}
                  placeholder="Bắt đầu"
                  isReadOnly={isReadOnly}
                  style={getFieldStyle(fields, `${item.id}.start`, {
                    color: "#64748B",
                  })}
                />
                <span>-</span>
                <EditableField
                  name={`content.sections.projects.items.${index}.end`}
                  placeholder="Hiện tại"
                  isReadOnly={isReadOnly}
                  style={getFieldStyle(fields, `${item.id}.end`, {
                    color: "#64748B",
                  })}
                />
              </div>
            </div>

            {/* Vai trò */}
            <div
              className="mt-0.5 font-medium text-slate-800"
              style={getFieldStyle(fields, `${item.id}.role`, {
                fontWeight: "500",
              })}
            >
              <EditableField
                name={`content.sections.projects.items.${index}.role`}
                placeholder="Vai trò trong dự án"
                isReadOnly={isReadOnly}
              />
            </div>

            {/* Mô tả */}
            <div
              className="mt-1 text-slate-700 leading-relaxed whitespace-pre-wrap block min-h-[20px]"
              style={getFieldStyle(fields, `${item.id}.description`, {
                color: "#334155",
              })}
            >
              <EditableField
                name={`content.sections.projects.items.${index}.description`}
                placeholder="• Mô tả công nghệ, đóng góp và kết quả..."
                multiline
                isReadOnly={isReadOnly}
                className="w-full block"
              />
            </div>
          </div>
        ))}

        {formItems.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-1 italic">
            Chưa có dự án nào.
          </p>
        )}
      </div>
    </div>
  );
};
