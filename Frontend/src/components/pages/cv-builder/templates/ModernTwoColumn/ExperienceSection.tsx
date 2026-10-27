import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { CVItemSection, CVExperienceItem, CVFieldStyle } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import { getFieldStyle } from "./utils";
import { EditableField } from "../../components/EditableField";
import ItemActions from "../../components/item-actions";
import type { CvEditorValues } from "@/features/cv-builder/schema/cvSchema";
import { useCvMutations } from "@/features/cv-builder/hooks/useCvMutations";

interface ExperienceSectionProps {
  section: CVItemSection<CVExperienceItem>;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
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
    name: "content.sections.experience.items",
    keyName: "_fieldKey",
  });

  const { cleanupItemStyles } = useCvMutations();

  if (!section.visible) return null;

  const handleAddAfter = (index: number) => {
    insert(index + 1, {
      id: `exp_${Date.now()}`,
      company: "Tên công ty / Doanh nghiệp",
      position: "Vị trí làm việc",
      startDate: "2024-01",
      endDate: null,
      description: "• Chịu trách nhiệm thực hiện các công việc chính...\n• Đạt được thành tích nổi bật...",
    });
  };

  const handleRemoveItem = (index: number, itemId: string) => {
    cleanupItemStyles(itemId);
    remove(index);
  };

  return (
    <div className="section-experience mb-3 group relative">
      <SectionTitle
        title={section.title || "KINH NGHIỆM LÀM VIỆC"}
        fieldKey="sections.experience.title"
        formFieldName="content.sections.experience.title"
        fields={fields}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
      />

      <div className="space-y-4">
        {formItems.map((item, index) => (
          <div key={item._fieldKey} className="group/item relative text-xs rounded-sm p-1 transition-all hover:bg-slate-50/60">
            {/* Action buttons riêng cho từng item nằm ở góc trên bên phải */}
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

            {/* Tên công ty & Thời gian */}
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span
                style={getFieldStyle(fields, `${item.id}.company`, {
                  fontWeight: "bold",
                })}
              >
                <EditableField
                  name={`content.sections.experience.items.${index}.company`}
                  placeholder="Tên công ty"
                  isReadOnly={isReadOnly}
                />
              </span>

              <div className="flex items-center gap-1 font-normal text-slate-600">
                <EditableField
                  name={`content.sections.experience.items.${index}.startDate`}
                  placeholder="Bắt đầu"
                  isReadOnly={isReadOnly}
                  style={getFieldStyle(fields, `${item.id}.startDate`, {
                    color: "#64748B",
                  })}
                />
                <span>-</span>
                <EditableField
                  name={`content.sections.experience.items.${index}.endDate`}
                  placeholder="Hiện tại"
                  isReadOnly={isReadOnly}
                  style={getFieldStyle(fields, `${item.id}.endDate`, {
                    color: "#64748B",
                  })}
                />
              </div>
            </div>

            {/* Vị trí làm việc */}
            <div
              className="mt-0.5 font-semibold text-slate-800"
              style={getFieldStyle(fields, `${item.id}.position`, {
                fontWeight: "600",
                color: "#1E293B",
              })}
            >
              <EditableField
                name={`content.sections.experience.items.${index}.position`}
                placeholder="Vị trí / Chức danh"
                isReadOnly={isReadOnly}
              />
            </div>

            {/* Mô tả & thành tích */}
            <div
              className="mt-1.5 text-slate-700 leading-relaxed whitespace-pre-wrap block min-h-[20px]"
              style={getFieldStyle(fields, `${item.id}.description`, {
                color: "#334155",
              })}
            >
              <EditableField
                name={`content.sections.experience.items.${index}.description`}
                placeholder="• Mô tả trách nhiệm và thành tích đạt được..."
                multiline
                isReadOnly={isReadOnly}
                className="w-full block"
              />
            </div>
          </div>
        ))}

        {formItems.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-1 italic">
            Chưa có kinh nghiệm làm việc nào.
          </p>
        )}
      </div>
    </div>
  );
};
