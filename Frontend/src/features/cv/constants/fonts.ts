export type CvFontId = "inter" | "roboto" | "merriweather";

export interface CvFontOption {
  id: CvFontId;
  name: string;
  fontFamily: string;
}

/**
 * Danh mục font chữ dùng chung cho CV Builder:
 * - Toolbar chung (đổi font toàn bộ CV)
 * - Floating toolbar của từng field rich text (TiptapField)
 */
export const CV_FONT_OPTIONS: CvFontOption[] = [
  {
    id: "inter",
    name: "Inter",
    fontFamily: "'inter', 'Inter', sans-serif",
  },
  {
    id: "roboto",
    name: "Roboto",
    fontFamily: "'roboto', 'Roboto', sans-serif",
  },
  {
    id: "merriweather",
    name: "Merriweather",
    fontFamily: "'merriweather', 'Merriweather', serif",
  },
];

export const DEFAULT_CV_FONT_ID: CvFontId = "inter";

/**
 * Lấy chuỗi CSS font-family chuẩn dựa theo mã font được chọn
 */
export function getCvFontFamilyCss(fontId?: string | null): string {
  switch (fontId?.toLowerCase()) {
    case "merriweather":
      return "'merriweather', 'Merriweather', serif";
    case "roboto":
      return "'roboto', 'Roboto', sans-serif";
    case "inter":
    default:
      return "'inter', 'Inter', sans-serif";
  }
}
