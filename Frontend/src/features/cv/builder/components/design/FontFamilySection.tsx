import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CV_FONT_OPTIONS, DEFAULT_CV_FONT_ID } from "../../../constants/fonts";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";

/**
 * FontFamilySection:
 * Khu vực chọn Font chữ cho CV
 */
export const FontFamilySection: React.FC = () => {
  const { setValue, control } = useFormContext<RichTextCvEditorValues>();

  const fontFamily =
    useWatch({
      control,
      name: "content.metadata.defaultStyle.fontFamily",
    }) || DEFAULT_CV_FONT_ID;

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-text-main uppercase">
        Font chữ
      </label>
      <Select
        value={fontFamily}
        onValueChange={(val) => {
          if (val) {
            setValue("content.metadata.defaultStyle.fontFamily", val, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }
        }}
      >
        <SelectTrigger className="h-9 w-full bg-surface text-xs">
          <SelectValue placeholder="Chọn font chữ" />
        </SelectTrigger>
        <SelectContent>
          {CV_FONT_OPTIONS.map((font) => (
            <SelectItem key={font.id} value={font.id}>
              {font.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
