import React, { useCallback, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Eye, EyeOff, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { FixedSectionKey } from "../../types";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";

const SECTION_DEFINITIONS: { key: FixedSectionKey; label: string }[] = [
  { key: "objective", label: "Mục tiêu nghề nghiệp" },
  { key: "experience", label: "Kinh nghiệm làm việc" },
  { key: "education", label: "Học vấn" },
  { key: "skills", label: "Kỹ năng" },
  { key: "projects", label: "Hoạt động" },
  { key: "certifications", label: "Chứng chỉ" },
  { key: "awards", label: "Danh hiệu và giải thưởng" },
  { key: "interests", label: "Sở thích" },
  { key: "additionalInfo", label: "Người giới thiệu" },
];

/**
 * CvBuilderLayoutTab:
 * Component nội dung tab Bố cục:
 * - Liệt kê các section Đang hiển thị với nút bật/tắt (Switch)
 * - Liệt kê các section Chưa hiển thị với nút Thêm/Khôi phục
 */
export const CvBuilderLayoutTab: React.FC = () => {
  const { control, setValue } = useFormContext<RichTextCvEditorValues>();

  const sectionsState = useWatch({
    control,
    name: "content.sections",
  });

  const handleToggleSection = useCallback(
    (key: FixedSectionKey, nextVisible: boolean) => {
      setValue(`content.sections.${key}.visible` as const, nextVisible, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const { visibleSections, hiddenSections } = useMemo(() => {
    const visible: typeof SECTION_DEFINITIONS = [];
    const hidden: typeof SECTION_DEFINITIONS = [];

    SECTION_DEFINITIONS.forEach((item) => {
      const sec = sectionsState?.[item.key];
      const isVisible =
        !sec ||
        typeof sec !== "object" ||
        (sec as { visible?: boolean }).visible !== false;
      if (isVisible) {
        visible.push(item);
      } else {
        hidden.push(item);
      }
    });

    return { visibleSections: visible, hiddenSections: hidden };
  }, [sectionsState]);

  return (
    <div className="space-y-6">
      {/* 1. Nhóm các mục đang hiển thị */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-main uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-text-muted" />
            Đang hiển thị ({visibleSections.length})
          </label>
        </div>

        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {visibleSections.map((sec) => (
            <div
              key={sec.key}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-bg/40 transition-colors"
            >
              <span className="text-xs font-medium text-text-main">{sec.label}</span>
              <Switch
                size="sm"
                checked={true}
                onCheckedChange={(checked) => handleToggleSection(sec.key, checked)}
                title={`Ẩn mục ${sec.label}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Nhóm các mục chưa hiển thị */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <EyeOff className="h-3.5 w-3.5 text-text-muted" />
            Chưa hiển thị ({hiddenSections.length})
          </label>
        </div>

        {hiddenSections.length > 0 ? (
          <div className="divide-y divide-border rounded-lg border border-dashed border-border bg-bg/40">
            {hiddenSections.map((sec) => (
              <div
                key={sec.key}
                className="flex items-center justify-between px-3 py-2.5 hover:bg-bg/80 transition-colors"
              >
                <span className="text-xs text-text-muted">{sec.label}</span>
                <button
                  type="button"
                  onClick={() => handleToggleSection(sec.key, true)}
                  className="flex cursor-pointer items-center gap-1 rounded bg-surface border border-border px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                  title={`Hiển thị lại mục ${sec.label}`}
                >
                  <Plus className="h-3 w-3" />
                  Thêm
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-text-muted">
            Tất cả các mục đang được hiển thị trên CV.
          </p>
        )}
      </div>
    </div>
  );
};
