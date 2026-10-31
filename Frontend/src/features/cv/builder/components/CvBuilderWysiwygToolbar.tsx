const FONT_SCALE_OPTIONS = [
  { value: 0.5, label: "50%" },
  { value: 0.6, label: "60%" },
  { value: 0.7, label: "70%" },
  { value: 0.8, label: "80%" },
  { value: 0.9, label: "90%" },
  { value: 1.0, label: "100%" },
  { value: 1.1, label: "110%" },
  { value: 1.2, label: "120%" },
  { value: 1.3, label: "130%" },
  { value: 1.4, label: "140%" },
  { value: 1.5, label: "150%" },
  { value: 1.6, label: "160%" },
  { value: 1.7, label: "170%" },
  { value: 1.8, label: "180%" },
  { value: 1.9, label: "190%" },
  { value: 2.0, label: "200%" },
];

import { Palette, Type } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";
import { CV_FONT_OPTIONS } from "../../constants/fonts";

const THEME_COLORS = [
  { name: "Classic Navy (Primary)", value: "#0F172A", light: "#D6F1FC" },
  { name: "SmartHire Sky (Secondary)", value: "#0284C7", light: "#E0F2FE" },
  { name: "Emerald Professional", value: "#047857", light: "#D1FAE5" },
  { name: "Slate Minimal", value: "#334155", light: "#F1F5F9" },
  { name: "Crimson Red", value: "#DC2626", light: "#FEE2E2" },
  { name: "Purple Elegance", value: "#7C3AED", light: "#EDE9FE" },
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
    <div className="no-print sticky top-15.25 z-100 flex flex-wrap items-center justify-center gap-3 border-b border-border bg-bg/95 px-6 py-2 shadow-xs backdrop-blur-md">
      {/* 1. Chọn Font chữ */}
      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 shadow-2xs">
        <Type className="h-4 w-4 text-text-muted" />
        <select
          {...register("content.metadata.defaultStyle.fontFamily")}
          className="bg-transparent text-xs font-medium text-text-main focus:outline-none cursor-pointer"
        >
          {CV_FONT_OPTIONS.map((font) => (
            <option key={font.id} value={font.id}>
              {font.name}
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

      {/* 3. Tỉ lệ cỡ chữ & Line Height */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1 text-xs text-text-main shadow-2xs">
        <span className="text-text-muted">Cỡ chữ:</span>
        <select
          {...register("content.metadata.defaultStyle.fontScale", {
            valueAsNumber: true,
          })}
          className="rounded border border-border bg-bg px-1.5 py-0.5 text-center text-xs text-text-main focus:border-primary focus:outline-none cursor-pointer"
        >
          {FONT_SCALE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

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
