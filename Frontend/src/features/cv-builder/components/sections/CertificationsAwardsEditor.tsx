import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { CvEditorValues } from "../../schema/cvSchema";
import { useCvMutations } from "../../hooks/useCvMutations";

interface CertificationsAwardsEditorProps {
  isReadOnly?: boolean;
}

export const CertificationsAwardsEditor: React.FC<CertificationsAwardsEditorProps> = ({
  isReadOnly = false,
}) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CvEditorValues>();

  const certArray = useFieldArray({
    control,
    name: "content.sections.certifications.items",
    keyName: "_fieldKey",
  });

  const awardArray = useFieldArray({
    control,
    name: "content.sections.awards.items",
    keyName: "_fieldKey",
  });

  const { cleanupItemStyles } = useCvMutations();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Chứng chỉ */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <input
            {...register("content.sections.certifications.title")}
            disabled={isReadOnly}
            className="w-1/2 rounded-lg border border-border bg-bg px-3 py-1.5 text-sm font-semibold text-text-main focus:border-primary focus:outline-none"
          />

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-text-main font-medium">
              <input
                type="checkbox"
                {...register("content.sections.certifications.visible")}
                disabled={isReadOnly}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              Bật
            </label>

            {!isReadOnly && (
              <button
                type="button"
                onClick={() =>
                  certArray.append({
                    id: `cert_${Date.now()}`,
                    name: "",
                    issueDate: null,
                  })
                }
                className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20"
              >
                <Plus className="h-3.5 w-3.5" /> Thêm
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          {certArray.fields.map((field, index) => {
            const err = errors.content?.sections?.certifications?.items?.[index];

            return (
              <div
                key={field._fieldKey}
                className="flex items-center gap-2 rounded-lg border border-border/80 bg-bg p-2.5"
              >
                <div className="flex-1">
                  <input
                    {...register(`content.sections.certifications.items.${index}.name`)}
                    disabled={isReadOnly}
                    placeholder="Tên chứng chỉ (VD: AWS Certified)"
                    className="w-full rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-text-main focus:border-primary focus:outline-none"
                  />
                  {err?.name && (
                    <p className="mt-0.5 text-[10px] text-status-error">{err.name.message}</p>
                  )}
                </div>

                <div className="w-28">
                  <input
                    {...register(`content.sections.certifications.items.${index}.issueDate`)}
                    disabled={isReadOnly}
                    placeholder="2025-08"
                    className="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-main focus:border-primary focus:outline-none"
                  />
                </div>

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      cleanupItemStyles(field.id);
                      certArray.remove(index);
                    }}
                    className="p-1 text-text-muted hover:text-status-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
          {certArray.fields.length === 0 && (
            <p className="text-center text-xs text-text-muted py-2">Chưa có chứng chỉ</p>
          )}
        </div>
      </div>

      {/* 2. Giải thưởng */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <input
            {...register("content.sections.awards.title")}
            disabled={isReadOnly}
            className="w-1/2 rounded-lg border border-border bg-bg px-3 py-1.5 text-sm font-semibold text-text-main focus:border-primary focus:outline-none"
          />

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-text-main font-medium">
              <input
                type="checkbox"
                {...register("content.sections.awards.visible")}
                disabled={isReadOnly}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              Bật
            </label>

            {!isReadOnly && (
              <button
                type="button"
                onClick={() =>
                  awardArray.append({
                    id: `award_${Date.now()}`,
                    awardName: "",
                    date: null,
                  })
                }
                className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20"
              >
                <Plus className="h-3.5 w-3.5" /> Thêm
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          {awardArray.fields.map((field, index) => {
            const err = errors.content?.sections?.awards?.items?.[index];

            return (
              <div
                key={field._fieldKey}
                className="flex items-center gap-2 rounded-lg border border-border/80 bg-bg p-2.5"
              >
                <div className="flex-1">
                  <input
                    {...register(`content.sections.awards.items.${index}.awardName`)}
                    disabled={isReadOnly}
                    placeholder="Tên giải thưởng (VD: Quán quân Hackathon)"
                    className="w-full rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-text-main focus:border-primary focus:outline-none"
                  />
                  {err?.awardName && (
                    <p className="mt-0.5 text-[10px] text-status-error">{err.awardName.message}</p>
                  )}
                </div>

                <div className="w-28">
                  <input
                    {...register(`content.sections.awards.items.${index}.date`)}
                    disabled={isReadOnly}
                    placeholder="2025-12"
                    className="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-main focus:border-primary focus:outline-none"
                  />
                </div>

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      cleanupItemStyles(field.id);
                      awardArray.remove(index);
                    }}
                    className="p-1 text-text-muted hover:text-status-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
          {awardArray.fields.length === 0 && (
            <p className="text-center text-xs text-text-muted py-2">Chưa có giải thưởng</p>
          )}
        </div>
      </div>
    </div>
  );
};
