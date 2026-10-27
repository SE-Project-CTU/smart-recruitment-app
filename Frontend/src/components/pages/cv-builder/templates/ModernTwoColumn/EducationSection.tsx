import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVItemSection, CVEducationItem, CVFieldStyle } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import { getFieldStyle } from "./utils";
import { EditableField } from "../../components/EditableField";
import ItemActions from "../../components/item-actions";
import type { CvEditorValues } from "@/features/cv-builder/schema/cvSchema";
import { useCvMutations } from "@/features/cv-builder/hooks/useCvMutations";

interface EducationSectionProps {
  section: CVItemSection<CVEducationItem>;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
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
    name: "content.sections.education.items",
    keyName: "_fieldKey",
  });

  const { cleanupItemStyles } = useCvMutations();

  if (!section.visible) return null;

  const handleAddAfter = (index: number) => {
    insert(index + 1, {
      id: `edu_${Date.now()}`,
      school: "Tên trường / Cơ sở đào tạo",
      title: "Chuyên ngành / Bằng cấp",
      start: "2020",
      end: "2024",
      details: "Xếp loại / Thành tích bổ sung",
    });
  };

  const handleRemoveItem = (index: number, itemId: string) => {
    cleanupItemStyles(itemId);
    remove(index);
  };

  return (
    <div className="section-education mb-3 group relative">
      <SectionTitle
        title={section.title || "HỌC VẤN"}
        fieldKey="sections.education.title"
        formFieldName="content.sections.education.title"
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

            {/* Hàng 1: Tên trường và Thời gian */}
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span
                style={getFieldStyle(fields, `${item.id}.school`, {
                  fontWeight: "bold",
                })}
              >
                <EditableField
                  name={`content.sections.education.items.${index}.school`}
                  placeholder="Tên trường học"
                  isReadOnly={isReadOnly}
                />
              </span>

              <div className="flex items-center gap-1 font-normal text-slate-600">
                <EditableField
                  name={`content.sections.education.items.${index}.start`}
                  placeholder="Bắt đầu"
                  isReadOnly={isReadOnly}
                  style={getFieldStyle(fields, `${item.id}.start`, {
                    color: "#64748B",
                  })}
                />
                <span>-</span>
                <EditableField
                  name={`content.sections.education.items.${index}.end`}
                  placeholder="Kết thúc"
                  isReadOnly={isReadOnly}
                  style={getFieldStyle(fields, `${item.id}.end`, {
                    color: "#64748B",
                  })}
                />
              </div>
            </div>

            {/* Hàng 2: Chuyên ngành / bằng cấp */}
            <div
              className="mt-0.5 font-medium text-slate-800"
              style={getFieldStyle(fields, `${item.id}.title`, {
                fontWeight: "500",
              })}
            >
              <EditableField
                name={`content.sections.education.items.${index}.title`}
                placeholder="Chuyên ngành / Bằng cấp"
                isReadOnly={isReadOnly}
              />
            </div>

            {/* Hàng 3: Xếp loại / chi tiết */}
            <div
              className="mt-0.5 text-slate-600"
              style={getFieldStyle(fields, `${item.id}.details`, {
                color: "#475569",
              })}
            >
              <EditableField
                name={`content.sections.education.items.${index}.details`}
                placeholder="Xếp loại / Thông tin chi tiết..."
                isReadOnly={isReadOnly}
              />
            </div>
          </div>
        ))}

        {formItems.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-1 italic">
            Chưa có thông tin học vấn.
          </p>
        )}
      </div>
    </div>
  );
};
