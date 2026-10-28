import { Palette, Type } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import type { RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";

export const THEME_COLORS = [
  { name: "Classic Navy (Primary)", value: "#0F172A", light: "#D6F1FC" },
  { name: "SmartHire Sky (Secondary)", value: "#0284C7", light: "#E0F2FE" },
  { name: "Emerald Professional", value: "#047857", light: "#D1FAE5" },
  { name: "Slate Minimal", value: "#334155", light: "#F1F5F9" },
  { name: "Crimson Red", value: "#DC2626", light: "#FEE2E2" },
  { name: "Purple Elegance", value: "#7C3AED", light: "#EDE9FE" },
];

export const FONT_OPTIONS = [
  { name: "Inter (Hiện đại)", value: "inter" },
  { name: "Roboto (Tiêu chuẩn)", value: "roboto" },
  { name: "Merriweather (Cổ điển Serif)", value: "merriweather" },
];

interface CvBuilderWysiwygToolbarProps {
  isCompleted: boolean;
}

/**
 * CvBuilderWysiwygToolbar:
 * Thanh công cụ phía trên gắn liền với FormProvider:
 * - Thay đổi font chữ toàn CV
 * - Chọn màu chủ đạo của CV
 * - Cỡ chữ cơ bản (Base font size)
 * - Khoảng cách dòng (Line height)
 */
export default function CvBuilderWysiwygToolbar({
  isCompleted,
}: CvBuilderWysiwygToolbarProps) {
  const { register, setValue, control } = useFormContext<RichTextCvEditorValues>();

  const currentStyles = useWatch({
    control,
    name: "content.metadata.defaultStyle",
  });

  const primaryColor = currentStyles?.primaryColors?.[0] || "#0F172A";

  if (isCompleted) return null;

  const handleSelectColor = (color: string) => {
    setValue("content.metadata.defaultStyle.primaryColors", [color, "#1E293B"], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="no-print sticky top-15.25 z-20 flex flex-wrap items-center justify-center gap-3 border-b border-border bg-bg/95 px-6 py-2 shadow-xs backdrop-blur-md">
      {/* 1. Chọn Font chữ */}
      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 shadow-2xs">
        <Type className="h-4 w-4 text-text-muted" />
        <select
          {...register("content.metadata.defaultStyle.fontFamily")}
          className="bg-transparent text-xs font-medium text-text-main focus:outline-none cursor-pointer"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Chọn Màu chủ đạo */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 shadow-2xs">
        <Palette className="h-4 w-4 text-text-muted" />
        <span className="text-xs text-text-muted">Màu chủ đạo:</span>
        <div className="flex items-center gap-1.5">
          {THEME_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => handleSelectColor(c.value)}
              className={`h-5 w-5 rounded-full transition-transform cursor-pointer ${
                primaryColor.toLowerCase() === c.value.toLowerCase()
                  ? "scale-125 ring-2 ring-primary ring-offset-1"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* 3. Cỡ chữ & Line Height */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1 text-xs text-text-main shadow-2xs">
        <span className="text-text-muted">Cỡ chữ:</span>
        <input
          type="number"
          min={11}
          max={16}
          {...register("content.metadata.defaultStyle.baseFontSize", {
            valueAsNumber: true,
          })}
          className="w-10 rounded border border-border bg-bg px-1 py-0.5 text-center text-xs focus:border-primary focus:outline-none"
        />
        <span className="text-slate-400">px</span>

        <div className="mx-1 h-4 w-px bg-border" />

        <span className="text-text-muted">Dãn dòng:</span>
        <input
          type="number"
          step="0.1"
          min={1.2}
          max={2.0}
          {...register("content.metadata.defaultStyle.lineHeight", {
            valueAsNumber: true,
          })}
          className="w-12 rounded border border-border bg-bg px-1 py-0.5 text-center text-xs focus:border-primary focus:outline-none"
        />
      </div>

    </div>
  );
}
