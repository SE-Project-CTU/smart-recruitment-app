import { Extension } from "@tiptap/react";
import type { Transaction } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import { Color, FontFamily, TextStyle } from "@tiptap/extension-text-style";

/**
 * Extension bổ sung thuộc tính fontSize cho document gốc (type: "doc"):
 * - Lưu cỡ mặc định của từng field trong attrs.fontSize
 * - Cho phép cập nhật qua lệnh setDocFontSize
 */
const CvDocFontSize = Extension.create({
  name: "cvDocFontSize",

  addGlobalAttributes() {
    return [
      {
        types: ["doc"],
        attributes: {
          fontSize: {
            default: 13,
            parseHTML: (element) => {
              const val = element.getAttribute("data-font-size");
              return val ? Number(val) : 13;
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              const size = Number(attributes.fontSize);
              return {
                "data-font-size": size,
                style: `font-size: calc(${size}px * var(--cv-font-scale, 1))`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setDocFontSize:
        (fontSize: number) =>
        ({ tr, dispatch }: { tr: Transaction; dispatch?: (tr: Transaction) => void }) => {
          if (dispatch) {
            tr.setDocAttribute("fontSize", Number(fontSize));
          }
          return true;
        },
    } as Record<string, unknown>;
  },
});

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
              const match = inline.match(
                /calc\(\s*([0-9.]+(?:px|pt|em|rem)?)/i,
              );
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
  CvDocFontSize,
  TextStyle,
  Color,
  FontFamily,
  CvFontSize,
  CvTextStyleAttributes,
  CvParagraphAlignment,
  CvListStyle,
];
