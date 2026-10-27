import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Type, Palette } from "lucide-react";
import type { CvEditorValues } from "../../schema/cvSchema";

const FONT_OPTIONS = [
  { name: "Inter (Hiện đại)", value: "inter" },
  { name: "Roboto (Tiêu chuẩn)", value: "roboto" },
  { name: "Merriweather (Cổ điển Serif)", value: "merriweather" },
];

const PRESET_COLORS = [
  { name: "Classic Navy", value: "#0F172A" },
  { name: "SmartHire Blue", value: "#2563EB" },
  { name: "Emerald Pro", value: "#059669" },
  { name: "Crimson Red", value: "#DC2626" },
  { name: "Purple Elegance", value: "#7C3AED" },
];

interface PresentationEditorProps {
  isReadOnly?: boolean;
}

export const PresentationEditor: React.FC<PresentationEditorProps> = ({
  isReadOnly = false,
}) => {
  const { register, setValue, control } = useFormContext<CvEditorValues>();

  const currentColors = useWatch({
    control,
    name: "presentation.styles.global.primaryColor",
  }) || ["#0F172A"];

  const primaryColor = currentColors[0] || "#0F172A";

  const handleSelectColor = (color: string) => {
    setValue("presentation.styles.global.primaryColor", [color, "#1E293B"], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
      <h3 className="mb-4 text-base font-semibold text-text-main">
        Giao diện & Định dạng toàn cục (Presentation)
      </h3>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {/* Font Family */}
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-muted">
            <Type className="h-3.5 w-3.5" /> Font chữ toàn CV
          </label>
          <select
            {...register("presentation.styles.global.fontFamily")}
            disabled={isReadOnly}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Màu chủ đạo */}
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-muted">
            <Palette className="h-3.5 w-3.5" /> Màu sắc chủ đạo
          </label>
          <div className="flex items-center gap-2.5 pt-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                disabled={isReadOnly}
                onClick={() => handleSelectColor(c.value)}
                className={`h-6 w-6 rounded-full transition-transform ${
                  primaryColor.toLowerCase() === c.value.toLowerCase()
                    ? "scale-125 ring-2 ring-primary ring-offset-2"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Cỡ chữ cơ bản & Line Height */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-text-muted">
              Cỡ chữ (px)
            </label>
            <input
              type="number"
              {...register("presentation.styles.global.baseFontSize", {
                valueAsNumber: true,
              })}
              disabled={isReadOnly}
              min={10}
              max={18}
              className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text-main focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-text-muted">
              Khoảng cách dòng
            </label>
            <input
              type="number"
              step="0.1"
              {...register("presentation.styles.global.lineHeight", {
                valueAsNumber: true,
              })}
              disabled={isReadOnly}
              min={1.2}
              max={2.0}
              className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text-main focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
