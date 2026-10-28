import { Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color, FontFamily, TextStyle } from "@tiptap/extension-text-style";
import FontSize from "@tiptap/extension-text-style/font-size";

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
  FontSize,
  CvTextStyleAttributes,
  CvParagraphAlignment,
  CvListStyle,
];
