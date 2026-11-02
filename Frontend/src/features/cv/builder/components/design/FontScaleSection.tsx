import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";
import { FONT_SCALE_OPTIONS } from "./designConstants";

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
    <div className="space-y-1.5">
      <label className="text-xs font-semibold tracking-wider text-text-main uppercase">
        Tỉ lệ cỡ chữ
      </label>
      <Select
        value={String(fontScale)}
        onValueChange={(val) => {
          if (val) {
            setValue("content.metadata.defaultStyle.fontScale", Number(val), {
              shouldDirty: true,
              shouldValidate: true,
            });
          }
        }}
      >
        <SelectTrigger className="h-9 w-full bg-surface text-xs">
          <SelectValue placeholder="Chọn tỉ lệ font" />
        </SelectTrigger>
        <SelectContent>
          {FONT_SCALE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
