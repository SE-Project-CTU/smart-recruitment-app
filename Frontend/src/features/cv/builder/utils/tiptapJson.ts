import type {
  CvTiptapAttributeValue,
  CvTiptapDocument,
  CvTiptapMark,
  CvTiptapNode,
  RichTextCVContentDocument,
} from "@/types/cv";

export function createEmptyTiptapDocument(fontSize = 13): CvTiptapDocument {
  return {
    type: "doc",
    attrs: { fontSize },
    content: [{ type: "paragraph" }],
  };
}

export function createBulletListDocument(
  items: string[] = [],
  fontSize = 13,
): CvTiptapDocument {
  const listItems = items.length > 0 ? items : [""];
  return {
    type: "doc",
    attrs: { fontSize },
    content: [
      {
        type: "bulletList",
        attrs: { listStyleType: "disc" },
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
  fallbackFontSize = 13,
): CvTiptapDocument {
  const sanitized = sanitizeTiptapNode(document);
  const currentFontSize =
    typeof document.attrs?.fontSize === "number"
      ? document.attrs.fontSize
      : Number(document.attrs?.fontSize) || fallbackFontSize;

  return {
    ...sanitized,
    type: "doc",
    attrs: {
      ...(sanitized.attrs ?? {}),
      fontSize: currentFontSize,
    },
    content: sanitized.content ?? [],
  };
}

export function extractTiptapPlainText(node: CvTiptapNode): string {
  return `${node.text ?? ""}${node.content?.map(extractTiptapPlainText).join("") ?? ""}`;
}

/**
 * Chuẩn hóa toàn bộ document trong CV content, đảm bảo mọi field rich text
 * đều có attrs.fontSize theo đúng quy định schema trước khi đưa vào editor hoặc lưu.
 */
export function normalizeCvContentFontSizes(
  content: RichTextCVContentDocument,
): RichTextCVContentDocument {
  if (!content) return content;

  const ensureDocFontSize = (
    doc: CvTiptapDocument | undefined,
    defaultSize: number,
  ): CvTiptapDocument => {
    if (!doc) return createEmptyTiptapDocument(defaultSize);
    const fontSize =
      typeof doc.attrs?.fontSize === "number"
        ? doc.attrs.fontSize
        : Number(doc.attrs?.fontSize) || defaultSize;
    return {
      ...doc,
      type: "doc",
      attrs: {
        ...(doc.attrs ?? {}),
        fontSize,
      },
    };
  };

  const { profile, sections } = content;

  if (profile) {
    profile.fullName = ensureDocFontSize(profile.fullName, 24);
    profile.title = ensureDocFontSize(profile.title, 15);
    profile.email = ensureDocFontSize(profile.email, 12);
    profile.phone = ensureDocFontSize(profile.phone, 12);
    profile.dob = ensureDocFontSize(profile.dob, 12);
    profile.address = ensureDocFontSize(profile.address, 12);
    profile.website = ensureDocFontSize(profile.website, 12);
    profile.socialLink = ensureDocFontSize(profile.socialLink, 12);
  }

  if (sections) {
    if (sections.objective) {
      sections.objective.title = ensureDocFontSize(sections.objective.title, 14);
      sections.objective.content = ensureDocFontSize(sections.objective.content, 13);
    }
    if (sections.interests) {
      sections.interests.title = ensureDocFontSize(sections.interests.title, 14);
      sections.interests.content = ensureDocFontSize(sections.interests.content, 13);
    }
    if (sections.additionalInfo) {
      sections.additionalInfo.title = ensureDocFontSize(sections.additionalInfo.title, 14);
      sections.additionalInfo.content = ensureDocFontSize(sections.additionalInfo.content, 13);
    }
    if (sections.experience) {
      sections.experience.title = ensureDocFontSize(sections.experience.title, 14);
      sections.experience.items?.forEach((item) => {
        item.company = ensureDocFontSize(item.company, 13);
        item.position = ensureDocFontSize(item.position, 13);
        item.startDate = ensureDocFontSize(item.startDate, 12);
        item.endDate = ensureDocFontSize(item.endDate, 12);
        item.description = ensureDocFontSize(item.description, 12);
      });
    }
    if (sections.education) {
      sections.education.title = ensureDocFontSize(sections.education.title, 14);
      sections.education.items?.forEach((item) => {
        item.school = ensureDocFontSize(item.school, 13);
        item.title = ensureDocFontSize(item.title, 13);
        item.start = ensureDocFontSize(item.start, 12);
        item.end = ensureDocFontSize(item.end, 12);
        item.details = ensureDocFontSize(item.details, 12);
      });
    }
    if (sections.skills) {
      sections.skills.title = ensureDocFontSize(sections.skills.title, 14);
      sections.skills.items?.forEach((item) => {
        item.name = ensureDocFontSize(item.name, 13);
        item.description = ensureDocFontSize(item.description, 12);
      });
    }
    if (sections.projects) {
      sections.projects.title = ensureDocFontSize(sections.projects.title, 14);
      sections.projects.items?.forEach((item) => {
        item.projectName = ensureDocFontSize(item.projectName, 13);
        item.role = ensureDocFontSize(item.role, 13);
        item.start = ensureDocFontSize(item.start, 12);
        item.end = ensureDocFontSize(item.end, 12);
        item.description = ensureDocFontSize(item.description, 12);
      });
    }
    if (sections.certifications) {
      sections.certifications.title = ensureDocFontSize(sections.certifications.title, 14);
      sections.certifications.items?.forEach((item) => {
        item.name = ensureDocFontSize(item.name, 13);
        item.issueDate = ensureDocFontSize(item.issueDate, 12);
      });
    }
    if (sections.awards) {
      sections.awards.title = ensureDocFontSize(sections.awards.title, 14);
      sections.awards.items?.forEach((item) => {
        item.awardName = ensureDocFontSize(item.awardName, 13);
        item.date = ensureDocFontSize(item.date, 12);
      });
    }
  }

  return content;
}
