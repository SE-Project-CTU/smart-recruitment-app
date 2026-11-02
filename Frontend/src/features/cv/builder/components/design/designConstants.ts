export const THEME_COLORS = [
  { name: "Than tối (Classic Dark)", value: "#262626" },
  { name: "Navy cổ điển (Classic Navy)", value: "#0F172A" },
  { name: "Xanh công nghệ (SmartHire Sky)", value: "#0284C7" },
  { name: "Xanh ngọc lục bảo (Emerald)", value: "#047857" },
  { name: "Xám tối giản (Slate Minimal)", value: "#334155" },
  { name: "Đỏ rượu (Crimson Red)", value: "#DC2626" },
  { name: "Tím thanh lịch (Purple Elegance)", value: "#7C3AED" },
  { name: "Xanh biển sâu (Deep Ocean)", value: "#1E3A8A" },
];

export const FONT_SCALE_OPTIONS = [
  { value: 0.5, label: "50%" },
  { value: 0.6, label: "60%" },
  { value: 0.7, label: "70%" },
  { value: 0.8, label: "80%" },
  { value: 0.9, label: "90%" },
  { value: 1.0, label: "100%" },
  { value: 1.1, label: "110%" },
  { value: 1.2, label: "120%" },
  { value: 1.3, label: "130%" },
  { value: 1.4, label: "140%" },
  { value: 1.5, label: "150%" },
  { value: 1.6, label: "160%" },
  { value: 1.7, label: "170%" },
  { value: 1.8, label: "180%" },
  { value: 1.9, label: "190%" },
  { value: 2.0, label: "200%" },
];

/**
 * Kiểm tra mã HEX hợp lệ: #RGB hoặc #RRGGBB
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color.trim());
}
