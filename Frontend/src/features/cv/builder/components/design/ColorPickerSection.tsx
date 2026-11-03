import React, { useState, useCallback, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";
import { isValidHexColor } from "./designConstants";
import { InlineColorPalette } from "./InlineColorPalette";
import {
  setCvPreviewColor,
  clearAllCvPreviewColors,
} from "../../utils/cvColorPreviewBridge";
import { useCvHistory, ChangeDesignSettingCommand } from "../../history";

/**
 * ColorPickerSection:
 * Khu vực chọn màu sắc chủ đạo của CV:
 * - Hàng các ô màu đơn giản, hiển thị hiệu ứng active khi chọn.
 * - Khi click vào 1 ô màu, hiển thị BẢNG MÀU TRỰC TIẾP bên dưới (InlineColorPalette).
 * - Không có ô text HEX lằng nhằng, không dùng native popup che màn hình.
 * - Trong lúc kéo chuột: Chỉ cập nhật preview qua cvColorPreviewBridge (CSS Custom Properties).
 * - Khi thả chuột: Lưu giá trị chính thức vào form một lần duy nhất.
 */
export const ColorPickerSection: React.FC = () => {
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(0);

  const { setValue, getValues, control } =
    useFormContext<RichTextCvEditorValues>();
  const { executeCommand } = useCvHistory();

  const watchedPrimaryColors = useWatch({
    control,
    name: "content.metadata.defaultStyle.primaryColors",
  });

  const rawColors =
    Array.isArray(watchedPrimaryColors) && watchedPrimaryColors.length > 0
      ? watchedPrimaryColors
      : ["#262626", "#EBECEE"];

  // Dọn dẹp preview khi component unmount
  useEffect(() => {
    return () => {
      clearAllCvPreviewColors();
    };
  }, []);

  /**
   * Lưu màu chính thức vào form store:
   * - Bỏ qua cập nhật nếu màu mới trùng với màu hiện tại.
   * - shouldDirty: true để đánh dấu CV có thay đổi.
   * - shouldValidate: false để không kích hoạt Zod resolver toàn cây document CV.
   */
  const commitColorChange = useCallback(
    (index: number, newColor: string) => {
      if (!isValidHexColor(newColor)) return;
      const formattedColor = newColor.trim().toUpperCase();
      const currentList = getValues(
        "content.metadata.defaultStyle.primaryColors",
      ) || ["#262626", "#EBECEE"];

      if (currentList[index] === formattedColor) {
        return;
      }

      const updated = [...currentList];
      updated[index] = formattedColor;
      const command = new ChangeDesignSettingCommand(
        "primaryColors",
        "content.metadata.defaultStyle.primaryColors",
        currentList,
        updated,
        setValue,
      );
      executeCommand(command);
    },
    [getValues, setValue, executeCommand],
  );

  /**
   * Khi kéo chuột trong bảng màu:
   * CHỈ cập nhật bằng bridge, hoàn toàn không gọi setState hay setValue của form.
   */
  const handleDragColor = useCallback(
    (hex: string) => {
      if (editingColorIndex === null) return;
      setCvPreviewColor(editingColorIndex, hex);
    },
    [editingColorIndex],
  );

  /**
   * Khi buông chuột hoặc click chọn màu mẫu:
   * Xóa CSS preview nháp và lưu màu chính thức vào form.
   */
  const handleCommitColor = useCallback(
    (hex: string) => {
      if (editingColorIndex === null) return;
      clearAllCvPreviewColors();
      commitColorChange(editingColorIndex, hex);
    },
    [editingColorIndex, commitColorChange],
  );

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold tracking-wider text-text-main uppercase">
        Màu sắc chủ đạo
      </label>

      {/* Hàng các ô màu: Click để chọn ô màu cần chỉnh sửa */}
      <div className="mt-1 flex flex-wrap items-center gap-3">
        {rawColors.map((color, index) => {
          const isEditing = editingColorIndex === index;

          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  clearAllCvPreviewColors();
                  setEditingColorIndex(isEditing ? null : index);
                }}
                className={cn(
                  "relative h-9 w-9 cursor-pointer rounded-lg border border-border/70 shadow-xs transition-all",
                  "active:scale-95",
                  isEditing
                    ? "scale-105 shadow-md ring-2 ring-primary ring-offset-1 ring-offset-surface"
                    : "hover:border-primary/50",
                )}
                style={{
                  backgroundColor: `var(--cv-preview-primary-${index + 1}, ${color})`,
                }}
              >
                {/* Chỉ báo active: chấm tròn nhỏ nổi bật giữa ô */}
                {isEditing && (
                  <span className="pointer-events-none absolute inset-0 m-auto h-2 w-2 rounded-full bg-white shadow-xs drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bảng màu trực tiếp hiển thị bên dưới ô màu đang được chọn */}
      {editingColorIndex !== null &&
        editingColorIndex < rawColors.length && (
          <div className="animate-in fade-in zoom-in-95 space-y-2.5 duration-150">
            {/* Bảng màu inline: Vùng chọn 2D + Thanh trượt Hue + Màu có sẵn */}
            <InlineColorPalette
              key={editingColorIndex}
              color={rawColors[editingColorIndex]}
              onDragColor={handleDragColor}
              onCommitColor={handleCommitColor}
            />
          </div>
        )}
    </div>
  );
};
