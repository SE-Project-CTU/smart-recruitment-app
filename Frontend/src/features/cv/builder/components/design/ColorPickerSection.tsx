import React, { useState, useCallback } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";
import { THEME_COLORS, isValidHexColor } from "./designConstants";

/**
 * ColorPickerSection:
 * Khu vực chọn màu sắc chủ đạo của CV:
 * - Hàng các ô màu đơn giản, hiển thị hiệu ứng active khi chọn.
 * - Bảng chọn màu mở rộng: Presets màu có sẵn, ô nhập mã HEX và native color picker.
 */
export const ColorPickerSection: React.FC = () => {
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [hexInputText, setHexInputText] = useState("");

  const { setValue, getValues, control } =
    useFormContext<RichTextCvEditorValues>();

  const currentStyles = useWatch({
    control,
    name: "content.metadata.defaultStyle",
  });

  const primaryColors =
    Array.isArray(currentStyles?.primaryColors) &&
    currentStyles.primaryColors.length > 0
      ? currentStyles.primaryColors
      : ["#0F172A", "#1E293B"];

  const handleColorChange = useCallback(
    (index: number, newColor: string) => {
      if (!isValidHexColor(newColor)) return;
      const formattedColor = newColor.trim().toUpperCase();
      const currentList = getValues(
        "content.metadata.defaultStyle.primaryColors",
      ) || ["#0F172A", "#1E293B"];
      const updated = [...currentList];
      updated[index] = formattedColor;
      setValue("content.metadata.defaultStyle.primaryColors", updated, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setHexInputText(formattedColor);
    },
    [getValues, setValue],
  );

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold tracking-wider text-text-main uppercase">
        Màu sắc chủ đạo
      </label>

      {/* Hàng các ô màu đơn giản, không có text */}
      <div className="flex flex-wrap items-center gap-2.5">
        {primaryColors.map((color, index) => {
          const isEditing = editingColorIndex === index;

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                if (isEditing) {
                  setEditingColorIndex(null);
                } else {
                  setEditingColorIndex(index);
                  setHexInputText(color);
                }
              }}
              className={cn(
                "relative h-8 w-8 cursor-pointer rounded-lg border border-border/70 shadow-xs transition-all",
                "active:scale-95",
                isEditing
                  ? "scale-105 shadow-md ring-2 ring-primary ring-offset-2 ring-offset-surface"
                  : "hover:border-primary/50",
              )}
              style={{ backgroundColor: color }}
              title={`Màu ${index + 1}: ${color}`}
              aria-label={`Màu ${index + 1}: ${color}`}
            >
              {/* Chỉ báo active: chấm tròn nhỏ nổi bật giữa ô */}
              {isEditing && (
                <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-white shadow-xs drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bảng màu phục vụ cho việc update ô màu đang active */}
      {editingColorIndex !== null &&
        editingColorIndex < primaryColors.length && (
          <div className="animate-in fade-in zoom-in-95 space-y-3 rounded-xl border border-border bg-bg/50 p-3 duration-150">
            {/* Bảng màu mẫu (Presets) */}
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-text-muted">
                Màu có sẵn:
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {THEME_COLORS.map((preset) => {
                  const currentColor = primaryColors[editingColorIndex];
                  const isSelected =
                    currentColor?.toLowerCase() ===
                    preset.value.toLowerCase();

                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() =>
                        handleColorChange(editingColorIndex, preset.value)
                      }
                      className="group relative flex h-7 w-full cursor-pointer items-center justify-center rounded-md border border-border transition-transform hover:scale-105"
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    >
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-white drop-shadow-xs" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ô nhập mã HEX và color picker */}
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-text-muted">
                Mã màu HEX:
              </p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={hexInputText}
                    placeholder="#0F172A"
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setHexInputText(val);
                      if (isValidHexColor(val)) {
                        handleColorChange(editingColorIndex, val);
                      }
                    }}
                    className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-xs text-text-main focus:border-primary focus:outline-none"
                  />
                </div>
                <label
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border shadow-xs"
                  title="Chọn màu qua bảng màu"
                  style={{
                    backgroundColor:
                      primaryColors[editingColorIndex] || "#0F172A",
                  }}
                >
                  <input
                    type="color"
                    value={
                      isValidHexColor(primaryColors[editingColorIndex] || "")
                        ? primaryColors[editingColorIndex]
                        : "#000000"
                    }
                    onChange={(e) =>
                      handleColorChange(editingColorIndex, e.target.value)
                    }
                    className="h-0 w-0 cursor-pointer opacity-0"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
