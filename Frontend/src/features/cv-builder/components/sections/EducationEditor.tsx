import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { CvEditorValues } from "../../schema/cvSchema";
import { useCvMutations } from "../../hooks/useCvMutations";

interface EducationEditorProps {
  isReadOnly?: boolean;
}

export const EducationEditor: React.FC<EducationEditorProps> = ({ isReadOnly = false }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CvEditorValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "content.sections.education.items",
    keyName: "_fieldKey",
  });

  const { cleanupItemStyles } = useCvMutations();
  const sectionErrors = errors.content?.sections?.education;

  const handleAddItem = () => {
    const newId = `edu_${Date.now()}`;
    append({
      id: newId,
      school: "",
      title: "",
      start: "",
      end: null,
      details: "",
    });
  };

  const handleRemoveItem = (index: number, itemId: string) => {
    cleanupItemStyles(itemId);
    remove(index);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1 max-w-sm">
          <label className="mb-1 block text-xs font-medium text-text-muted">Tiêu đề mục</label>
          <input
            {...register("content.sections.education.title")}
            disabled={isReadOnly}
            className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm font-semibold text-text-main focus:border-primary focus:outline-none"
          />
          {sectionErrors?.title && (
            <p className="mt-1 text-xs text-status-error">{sectionErrors.title.message}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-text-main font-medium">
            <input
              type="checkbox"
              {...register("content.sections.education.visible")}
              disabled={isReadOnly}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
            Hiển thị
          </label>

          {!isReadOnly && (
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm học vấn
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const itemError = sectionErrors?.items?.[index];

          return (
            <div
              key={field._fieldKey}
              className="relative rounded-lg border border-border/80 bg-bg p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted">
                  Học vấn #{index + 1}
                </span>

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index, field.id)}
                    className="flex items-center gap-1 text-xs text-status-error hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Xóa
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-muted">
                    Trường / Cơ sở đào tạo <span className="text-status-error">*</span>
                  </label>
                  <input
                    {...register(`content.sections.education.items.${index}.school`)}
                    disabled={isReadOnly}
                    placeholder="Đại học Bách Khoa"
                    className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-main focus:border-primary focus:outline-none"
                  />
                  {itemError?.school && (
                    <p className="mt-1 text-xs text-status-error">{itemError.school.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-text-muted">
                    Chuyên ngành / Bằng cấp <span className="text-status-error">*</span>
                  </label>
                  <input
                    {...register(`content.sections.education.items.${index}.title`)}
                    disabled={isReadOnly}
                    placeholder="Kỹ sư Công nghệ Thông tin"
                    className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-main focus:border-primary focus:outline-none"
                  />
                  {itemError?.title && (
                    <p className="mt-1 text-xs text-status-error">{itemError.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-text-muted">
                    Năm bắt đầu (VD: 2020-09)
                  </label>
                  <input
                    {...register(`content.sections.education.items.${index}.start`)}
                    disabled={isReadOnly}
                    placeholder="2020-09"
                    className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-main focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-text-muted">
                    Năm tốt nghiệp (VD: 2024-06)
                  </label>
                  <input
                    {...register(`content.sections.education.items.${index}.end`)}
                    disabled={isReadOnly}
                    placeholder="2024-06"
                    className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-main focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium text-text-muted">
                  Xếp loại / Thành tích bổ sung
                </label>
                <input
                  {...register(`content.sections.education.items.${index}.details`)}
                  disabled={isReadOnly}
                  placeholder="Tốt nghiệp loại Giỏi, GPA 3.6/4.0"
                  className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-main focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          );
        })}

        {fields.length === 0 && (
          <p className="py-4 text-center text-xs text-text-muted">
            Chưa có thông tin học vấn nào. Bấm "Thêm học vấn" để tạo mới.
          </p>
        )}
      </div>
    </div>
  );
};
