import React from "react";
import { useFormContext } from "react-hook-form";
import type { CvEditorValues } from "../../schema/cvSchema";

interface TextSectionEditorProps {
  sectionKey: "objective" | "interests" | "additionalInfo";
  defaultTitle: string;
  isReadOnly?: boolean;
}

export const TextSectionEditor: React.FC<TextSectionEditorProps> = ({
  sectionKey,
  defaultTitle,
  isReadOnly = false,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CvEditorValues>();

  const sectionErrors = errors.content?.sections?.[sectionKey];

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1 max-w-sm">
          <label className="mb-1 block text-xs font-medium text-text-muted">Tiêu đề mục</label>
          <input
            {...register(`content.sections.${sectionKey}.title`)}
            disabled={isReadOnly}
            defaultValue={defaultTitle}
            className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm font-semibold text-text-main focus:border-primary focus:outline-none"
          />
          {sectionErrors?.title && (
            <p className="mt-1 text-xs text-status-error">{sectionErrors.title.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs text-text-main font-medium">
          <input
            type="checkbox"
            {...register(`content.sections.${sectionKey}.visible`)}
            disabled={isReadOnly}
            className="h-4 w-4 rounded text-primary focus:ring-primary"
          />
          Hiển thị mục này
        </label>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-text-muted">Nội dung</label>
        <textarea
          {...register(`content.sections.${sectionKey}.content`)}
          disabled={isReadOnly}
          rows={3}
          placeholder={`Nhập nội dung cho mục ${defaultTitle}...`}
          className="w-full rounded-lg border border-border bg-bg p-3 text-sm text-text-main focus:border-primary focus:outline-none"
        />
        {sectionErrors?.content && (
          <p className="mt-1 text-xs text-status-error">{sectionErrors.content.message}</p>
        )}
      </div>
    </div>
  );
};
