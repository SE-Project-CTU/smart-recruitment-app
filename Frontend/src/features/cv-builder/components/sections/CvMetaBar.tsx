import React from "react";
import { useFormContext } from "react-hook-form";
import type { CvEditorValues } from "../../schema/cvSchema";

interface CvMetaBarProps {
  isReadOnly?: boolean;
}

export const CvMetaBar: React.FC<CvMetaBarProps> = ({ isReadOnly = false }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CvEditorValues>();

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Tiêu đề CV */}
        <div className="flex-1 min-w-[280px]">
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Tiêu đề CV (Hồ sơ) <span className="text-status-error">*</span>
          </label>
          <input
            {...register("title")}
            disabled={isReadOnly}
            placeholder="VD: Senior Fullstack Developer - 2026"
            className="w-full rounded-lg border border-border bg-bg px-3.5 py-2 text-sm font-medium text-text-main focus:border-primary focus:outline-none"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-status-error">{errors.title.message}</p>
          )}
        </div>

        {/* Ngôn ngữ & Công khai */}
        <div className="flex items-center gap-4 pt-4 sm:pt-0">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">Ngôn ngữ</label>
            <select
              {...register("language")}
              disabled={isReadOnly}
              className="rounded-lg border border-border bg-bg px-3 py-2 text-xs font-medium text-text-main focus:border-primary focus:outline-none"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-main">
              <input
                type="checkbox"
                {...register("isPublic")}
                disabled={isReadOnly}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              Công khai hồ sơ
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
