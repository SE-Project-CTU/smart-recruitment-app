import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Slider } from "@/components/ui/slider";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";

/**
 * LineHeightSection:
 * Khu vực điều chỉnh Khoảng cách dòng (Line height) cho CV
 */
export const LineHeightSection: React.FC = () => {
  const { setValue, control } = useFormContext<RichTextCvEditorValues>();

  const lineHeight =
    useWatch({
      control,
      name: "content.metadata.defaultStyle.lineHeight",
    }) ?? 1.5;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wider text-text-main uppercase">
          Khoảng cách dòng
        </label>
        <span className="rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-xs font-medium text-text-main">
          {lineHeight.toFixed(2)}x
        </span>
      </div>
      <Slider
        value={[lineHeight]}
        min={1.2}
        max={2.0}
        step={0.05}
        onValueChange={(val) => {
          const nextVal = Array.isArray(val) ? val[0] : val;
          if (typeof nextVal === "number") {
            setValue(
              "content.metadata.defaultStyle.lineHeight",
              Number(nextVal.toFixed(2)),
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
        <span>1.2x (Gọn)</span>
        <span>1.5x (Chuẩn)</span>
        <span>2.0x (Rộng)</span>
      </div>
    </div>
  );
};
