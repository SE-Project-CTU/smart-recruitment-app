import type {
  CvTiptapAttributeValue,
  CvTiptapDocument,
  CvTiptapMark,
  CvTiptapNode,
} from "@/types/cv";

export function createEmptyTiptapDocument(): CvTiptapDocument {
  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
}

export function createBulletListDocument(
  items: string[] = [],
): CvTiptapDocument {
  const listItems = items.length > 0 ? items : [""];
  return {
    type: "doc",
    content: [
      {
        type: "bulletList",
        content: listItems.map((text) => ({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              ...(text ? { content: [{ type: "text", text }] } : {}),
            },
          ],
        })),
      },
    ],
  };
}

function removeNullAttributes<T extends { attrs?: Record<string, unknown> }>(
  value: T,
): T {
  if (!value.attrs) return value;

  const attrs = Object.fromEntries(
    Object.entries(value.attrs).filter(
      ([, attributeValue]) =>
        attributeValue !== null && attributeValue !== undefined,
    ),
  );

  if (Object.keys(attrs).length === 0) {
    const withoutAttrs = { ...value };
    delete withoutAttrs.attrs;
    return withoutAttrs;
  }

  return { ...value, attrs };
}

function sanitizeMark(mark: CvTiptapMark): CvTiptapMark {
  if (mark.type === "link" && mark.attrs) {
    const { href, target } = mark.attrs;
    const sanitizedAttrs: Record<string, CvTiptapAttributeValue> = { href };
    if (target) sanitizedAttrs.target = target;
    return {
      type: "link",
      attrs: sanitizedAttrs,
    };
  }
  return removeNullAttributes(mark);
}

export function sanitizeTiptapNode(node: CvTiptapNode): CvTiptapNode {
  const sanitized = removeNullAttributes({
    ...node,
    ...(node.marks ? { marks: node.marks.map(sanitizeMark) } : {}),
    ...(node.content ? { content: node.content.map(sanitizeTiptapNode) } : {}),
  });

  if (sanitized.marks) {
    sanitized.marks = sanitized.marks.filter(
      (mark) => !mark.attrs || Object.keys(mark.attrs).length > 0,
    );
  }

  return sanitized;
}

export function sanitizeTiptapDocument(
  document: CvTiptapDocument,
): CvTiptapDocument {
  const sanitized = sanitizeTiptapNode(document);
  return {
    ...sanitized,
    type: "doc",
    content: sanitized.content ?? [],
  };
}

export function extractTiptapPlainText(node: CvTiptapNode): string {
  return `${node.text ?? ""}${node.content?.map(extractTiptapPlainText).join("") ?? ""}`;
}
