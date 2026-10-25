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
