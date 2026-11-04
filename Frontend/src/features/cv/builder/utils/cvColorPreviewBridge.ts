/**
 * cvColorPreviewBridge:
 * Cầu nối preview màu thời gian thực cho CV Builder mà không kích hoạt
 * chu kỳ React re-render hay cập nhật React Hook Form trong lúc người dùng rê/kéo chuột.
 *
 * Hoạt động thông qua CSS custom properties (--cv-preview-primary-1, --cv-preview-primary-2)
 * gắn trực tiếp trên document.documentElement.
 */

export function setCvPreviewColor(colorIndex: number, hexColor: string): void {
  if (typeof document === "undefined") return;
  const varName = `--cv-preview-primary-${colorIndex + 1}`;
  document.documentElement.style.setProperty(varName, hexColor);
}

export function clearCvPreviewColor(colorIndex: number): void {
  if (typeof document === "undefined") return;
  const varName = `--cv-preview-primary-${colorIndex + 1}`;
  document.documentElement.style.removeProperty(varName);
}

export function clearAllCvPreviewColors(): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.removeProperty("--cv-preview-primary-1");
  document.documentElement.style.removeProperty("--cv-preview-primary-2");
}
