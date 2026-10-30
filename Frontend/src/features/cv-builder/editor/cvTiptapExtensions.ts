import { Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color, FontFamily, TextStyle } from "@tiptap/extension-text-style";


/**
 * Extension quản lý cỡ chữ (FontSize) có hỗ trợ scale động:
 * - Lưu cỡ gốc trong JSON (ví dụ "14px")
 * - Khi render ra HTML: style="font-size: calc(14px * var(--cv-font-scale, 1))"
 * - Khi thay đổi fontScale ở toolbar chung, cỡ chữ Tiptap tự scale theo tỉ lệ chung
 */
const CvFontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              const inline = element.style.fontSize;
              if (!inline) return null;
              const match = inline.match(/calc\(\s*([0-9.]+(?:px|pt|em|rem)?)/i);
              return match ? match[1] : inline;
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              const raw = String(attributes.fontSize).trim();
              const val = /^[0-9.]+$/.test(raw) ? `${raw}px` : raw;
              return {
                style: `font-size: calc(${val} * var(--cv-font-scale, 1))`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

const CvTextStyleAttributes = Extension.create({
  name: "cvTextStyleAttributes",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontWeight: {
            default: null,
            parseHTML: (element) => element.style.fontWeight || null,
            renderHTML: (attributes) =>
              attributes.fontWeight
                ? { style: `font-weight: ${attributes.fontWeight}` }
                : {},
          },
          fontStyle: {
            default: null,
            parseHTML: (element) => element.style.fontStyle || null,
            renderHTML: (attributes) =>
              attributes.fontStyle
                ? { style: `font-style: ${attributes.fontStyle}` }
                : {},
          },
          textDecoration: {
            default: null,
            parseHTML: (element) => element.style.textDecoration || null,
            renderHTML: (attributes) =>
              attributes.textDecoration
                ? { style: `text-decoration: ${attributes.textDecoration}` }
                : {},
          },
        },
      },
    ];
  },
});

const CvParagraphAlignment = Extension.create({
  name: "cvParagraphAlignment",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element) => element.style.textAlign || null,
            renderHTML: (attributes) =>
              attributes.textAlign
                ? { style: `text-align: ${attributes.textAlign}` }
                : {},
          },
        },
      },
    ];
  },
});

const CvListStyle = Extension.create({
  name: "cvListStyle",

  addGlobalAttributes() {
    return [
      {
        types: ["bulletList", "orderedList"],
        attributes: {
          listStyleType: {
            default: null,
            parseHTML: (element) => element.style.listStyleType || null,
            renderHTML: (attributes) =>
              attributes.listStyleType
                ? { style: `list-style-type: ${attributes.listStyleType}` }
                : {},
          },
        },
      },
    ];
  },
});

export const cvTiptapExtensions = [
  StarterKit.configure({ trailingNode: false }),
  TextStyle,
  Color,
  FontFamily,
  CvFontSize,
  CvTextStyleAttributes,
  CvParagraphAlignment,
  CvListStyle,
];
