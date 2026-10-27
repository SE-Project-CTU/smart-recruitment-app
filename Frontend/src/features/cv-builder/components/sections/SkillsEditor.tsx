import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { CvEditorValues } from "../../schema/cvSchema";
import { useCvMutations } from "../../hooks/useCvMutations";

interface SkillsEditorProps {
  isReadOnly?: boolean;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({ isReadOnly = false }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CvEditorValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "content.sections.skills.items",
    keyName: "_fieldKey",
  });

  const { cleanupItemStyles } = useCvMutations();
  const sectionErrors = errors.content?.sections?.skills;

  const handleAddItem = () => {
    const newId = `sk_${Date.now()}`;
    append({
      id: newId,
      name: "",
      description: "",
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
            {...register("content.sections.skills.title")}
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
              {...register("content.sections.skills.visible")}
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
              <Plus className="h-3.5 w-3.5" /> Thêm kỹ năng
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => {
          const itemError = sectionErrors?.items?.[index];

          return (
            <div
              key={field._fieldKey}
              className="flex items-start gap-3 rounded-lg border border-border/80 bg-bg p-3"
            >
              <div className="w-1/3">
                <input
                  {...register(`content.sections.skills.items.${index}.name`)}
                  disabled={isReadOnly}
                  placeholder="Tên kỹ năng (VD: React / TypeScript)"
                  className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-main focus:border-primary focus:outline-none"
                />
                {itemError?.name && (
                  <p className="mt-1 text-xs text-status-error">{itemError.name.message}</p>
                )}
              </div>

              <div className="flex-1">
                <input
                  {...register(`content.sections.skills.items.${index}.description`)}
                  disabled={isReadOnly}
                  placeholder="Mô tả mức độ thành thạo hoặc công nghệ liên quan..."
                  className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-main focus:border-primary focus:outline-none"
                />
              </div>

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index, field.id)}
                  className="mt-1 p-1 text-text-muted hover:text-status-error"
                  title="Xóa kỹ năng"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}

        {fields.length === 0 && (
          <p className="py-4 text-center text-xs text-text-muted">
            Chưa có kỹ năng nào. Bấm "Thêm kỹ năng" để tạo mới.
          </p>
        )}
      </div>
    </div>
  );
};
