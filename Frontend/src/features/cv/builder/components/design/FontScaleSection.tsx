import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Slider } from "@/components/ui/slider";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";

/**
 * FontScaleSection:
 * Khu vực chọn Tỉ lệ cỡ chữ (Font scale) cho CV (từ 50% đến 200%)
 */
export const FontScaleSection: React.FC = () => {
  const { setValue, control } = useFormContext<RichTextCvEditorValues>();

  const fontScale =
    useWatch({
      control,
      name: "content.metadata.defaultStyle.fontScale",
    }) ?? 1.0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wider text-text-main uppercase">
          Tỉ lệ cỡ chữ
        </label>
        <span className="rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-xs font-medium text-text-main">
          {Math.round(fontScale * 100)}%
        </span>
      </div>
      <Slider
        value={[fontScale]}
        min={0.5}
        max={2.0}
        step={0.1}
        onValueChange={(val) => {
          const nextVal = Array.isArray(val) ? val[0] : val;
          if (typeof nextVal === "number") {
            setValue(
              "content.metadata.defaultStyle.fontScale",
              Number(nextVal.toFixed(1)),
              {
                shouldDirty: true,
                shouldValidate: true,
              },
            );
          }
        }}
        className="cursor-pointer py-1.5 [&_[data-slot=slider-range]]:h-full [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:w-full [&_[data-slot=slider-track]]:bg-border"
      />
      <div className="flex justify-between text-[10px] text-text-muted">
        <span>Nhỏ</span>
        <span>Lớn</span>
      </div>
    </div>
  );
};
