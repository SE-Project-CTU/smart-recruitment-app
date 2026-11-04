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

/**
 * Kiểm tra mã HEX hợp lệ: #RGB hoặc #RRGGBB
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color.trim());
}

export interface HSVColor {
  h: number; // 0 - 360
  s: number; // 0 - 1
  v: number; // 0 - 1
}

/**
 * Chuyển đổi mã màu HEX sang HSV
 */
export function hexToHsv(hex: string): HSVColor {
  let cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : diff / max;
  const v = max;

  return { h, s, v };
}

/**
 * Chuyển đổi màu HSV sang mã HEX (#RRGGBB)
 */
export function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c;
    gPrime = x;
    bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x;
    gPrime = c;
    bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0;
    gPrime = c;
    bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0;
    gPrime = x;
    bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x;
    gPrime = 0;
    bPrime = c;
  } else {
    rPrime = c;
    gPrime = 0;
    bPrime = x;
  }

  const r = Math.round((rPrime + m) * 255);
  const g = Math.round((gPrime + m) * 255);
  const b = Math.round((bPrime + m) * 255);

  const toHex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
