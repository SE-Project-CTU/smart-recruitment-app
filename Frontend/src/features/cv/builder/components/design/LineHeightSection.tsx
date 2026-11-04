import React, { useRef, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Slider } from "@/components/ui/slider";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";
import { useCvHistory, ChangeDesignSettingCommand } from "../../history";

const LINE_HEIGHT_MIN = 1.0;
const LINE_HEIGHT_MAX = 2.0;
const LINE_HEIGHT_STEP = 0.05;

/**
 * LineHeightSection:
 * Khu vực điều chỉnh Khoảng cách dòng (Line height) cho CV
 */
export const LineHeightSection: React.FC = () => {
  const { setValue, control } = useFormContext<RichTextCvEditorValues>();
  const { executeCommand } = useCvHistory();

  const lineHeight =
    useWatch({
      control,
      name: "content.metadata.defaultStyle.lineHeight",
    }) ?? 1.5;

  const startLineHeightRef = useRef(lineHeight);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!isDraggingRef.current) {
      startLineHeightRef.current = lineHeight;
    }
  }, [lineHeight]);

  const handleValueChange = (val: number | readonly number[]) => {
    const nextVal = Array.isArray(val) ? val[0] : val;
    if (typeof nextVal === "number") {
      isDraggingRef.current = true;
      setValue(
        "content.metadata.defaultStyle.lineHeight",
        Number(nextVal.toFixed(2)),
        {
          shouldDirty: true,
          shouldValidate: false,
        },
      );
    }
  };

  const handleValueCommitted = (val: number | readonly number[]) => {
    isDraggingRef.current = false;
    const finalVal = Array.isArray(val) ? val[0] : val;
    if (typeof finalVal === "number") {
      const formattedFinal = Number(finalVal.toFixed(2));
      if (formattedFinal !== startLineHeightRef.current) {
        const command = new ChangeDesignSettingCommand(
          "lineHeight",
          "content.metadata.defaultStyle.lineHeight",
          startLineHeightRef.current,
          formattedFinal,
          setValue,
        );
        executeCommand(command);
        startLineHeightRef.current = formattedFinal;
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wider text-text-main uppercase">
          Khoảng cách dòng
        </label>
        <span className="rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-xs font-medium text-text-main">
          {lineHeight.toFixed(1)}x
        </span>
      </div>
      <Slider
        value={[lineHeight]}
        min={LINE_HEIGHT_MIN}
        max={LINE_HEIGHT_MAX}
        step={LINE_HEIGHT_STEP}
        onValueChange={handleValueChange}
        onValueCommitted={handleValueCommitted}
        className="cursor-pointer py-1.5 [&_[data-slot=slider-range]]:h-full [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:w-full [&_[data-slot=slider-track]]:bg-border"
      />
      <div className="flex justify-between text-[10px] text-text-muted">
        <span>{LINE_HEIGHT_MIN.toFixed(1)}</span>
        <span>{LINE_HEIGHT_MAX.toFixed(1)}</span>
      </div>
    </div>
  );
};
