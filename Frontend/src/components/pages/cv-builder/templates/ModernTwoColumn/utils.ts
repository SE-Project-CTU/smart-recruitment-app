import type React from "react";
import type { CVFieldStyle } from "@/types/cv";

/**
 * Chuyển đổi CVFieldStyle sang React.CSSProperties
 */
export function getFieldStyle(
  fields: Record<string, CVFieldStyle> | undefined,
  fieldPath: string,
  fallback?: React.CSSProperties
): React.CSSProperties {
  const style = fields?.[fieldPath];
  if (!style) return fallback || {};

  const css: React.CSSProperties = { ...fallback };

  if (style.color) css.color = style.color;
  if (style.fontSize) css.fontSize = `${style.fontSize}px`;
  if (style.fontFamily) css.fontFamily = style.fontFamily;
  if (style.fontWeight) css.fontWeight = style.fontWeight;
  if (style.fontStyle) css.fontStyle = style.fontStyle;
  if (style.textDecoration) css.textDecoration = style.textDecoration;
  if (style.textAlign) css.textAlign = style.textAlign;

  return css;
}

/**
 * Tạo một bản sao mới của fields dictionary đã cập nhật một field cụ thể
 * Thích hợp dùng trong reducer, state updater hoặc util độc lập
 */
export function mergeFieldStyle(
  currentFields: Record<string, CVFieldStyle> = {},
  fieldPath: string,
  updates: Partial<CVFieldStyle>
): Record<string, CVFieldStyle> {
  return {
    ...currentFields,
    [fieldPath]: {
      ...(currentFields[fieldPath] || {}),
      ...updates,
    },
  };
}

/**
 * Xóa một fieldStyle khỏi dictionary
 */
export function omitFieldStyle(
  currentFields: Record<string, CVFieldStyle> = {},
  fieldPath: string
): Record<string, CVFieldStyle> {
  const result = { ...currentFields };
  delete result[fieldPath];
  return result;
}
