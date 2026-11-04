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

export function createTiptapDocumentFromText(
  text: string,
  fontSize = 13,
): CvTiptapDocument {
  const paragraphs = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return createEmptyTiptapDocument(fontSize);
  }

  return {
    type: "doc",
    attrs: { fontSize },
    content: paragraphs.map((p) => ({
      type: "paragraph",
      content: [{ type: "text", text: p }],
    })),
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

function sanitizeMark(mark: CvTiptapMark): CvTiptapMark | null {
  if (mark.type === "textStyle") {
    if (!mark.attrs) return null;
    const cleanedAttrs: Record<string, CvTiptapAttributeValue> = {};
    for (const [key, val] of Object.entries(mark.attrs)) {
      if (val === null || val === undefined) continue;
      // Bỏ các giá trị rỗng hoặc chỉ có khoảng trắng ở color, fontFamily, fontSize...
      if (typeof val === "string" && val.trim() === "") continue;
      cleanedAttrs[key] = val as CvTiptapAttributeValue;
    }
    // Nếu mark không còn attr hợp lệ thì bỏ cả mark
    if (Object.keys(cleanedAttrs).length === 0) {
      return null;
    }
    return {
      type: "textStyle",
      attrs: cleanedAttrs,
    };
  }

  if (mark.type === "link") {
    if (!mark.attrs) return null;
    const href = mark.attrs.href;
    // Bỏ cả mark nếu href rỗng hoặc chỉ có khoảng trắng
    if (href === null || href === undefined) return null;
    if (typeof href === "string" && href.trim() === "") return null;

    const cleanedAttrs: Record<string, CvTiptapAttributeValue> = {
      href: href as CvTiptapAttributeValue,
    };

    // Bỏ target nếu rỗng hoặc chỉ có khoảng trắng
    const target = mark.attrs.target;
    if (target !== null && target !== undefined) {
      if (typeof target !== "string" || target.trim() !== "") {
        cleanedAttrs.target = target as CvTiptapAttributeValue;
      }
    }

    return {
      type: "link",
      attrs: cleanedAttrs,
    };
  }

  return removeNullAttributes(mark);
}

function sanitizeNodeAttrs(
  _nodeType: string,
  attrs?: Record<string, unknown>,
): Record<string, CvTiptapAttributeValue> | undefined {
  if (!attrs) return undefined;

  const cleaned: Record<string, CvTiptapAttributeValue> = {};

  for (const [key, val] of Object.entries(attrs)) {
    if (val === null || val === undefined) continue;

    // Bỏ textAlign khi giá trị rỗng hoặc chỉ có khoảng trắng
    if (key === "textAlign" && typeof val === "string" && val.trim() === "") {
      continue;
    }

    // Bỏ listStyleType khi giá trị rỗng hoặc chỉ có khoảng trắng
    if (
      key === "listStyleType" &&
      typeof val === "string" &&
      val.trim() === ""
    ) {
      continue;
    }

    cleaned[key] = val as CvTiptapAttributeValue;
  }

  if (Object.keys(cleaned).length === 0) {
    return undefined;
  }

  return cleaned;
}

export function sanitizeTiptapNode(node: CvTiptapNode): CvTiptapNode {
  const cleanedAttrs = sanitizeNodeAttrs(
    node.type,
    node.attrs as Record<string, unknown>,
  );

  const sanitizedMarks = node.marks
    ?.map(sanitizeMark)
    .filter((mark): mark is CvTiptapMark => mark !== null);

  const sanitizedContent = node.content?.map(sanitizeTiptapNode);

  const result: CvTiptapNode = {
    type: node.type,
    ...(cleanedAttrs ? { attrs: cleanedAttrs } : {}),
    ...(node.text !== undefined ? { text: node.text } : {}),
    ...(sanitizedMarks && sanitizedMarks.length > 0
      ? { marks: sanitizedMarks }
      : {}),
    ...(sanitizedContent ? { content: sanitizedContent } : {}),
  };

  return result;
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
 * Chuẩn hóa toàn bộ document trong RichTextCVContentDocument:
 * - Đảm bảo mọi document đều có attrs.fontSize theo chuẩn.
 * - Loại bỏ các attribute rỗng hoặc chỉ có khoảng trắng:
 *   + textStyle: color, fontFamily, fontSize (bỏ cả mark nếu không còn attr)
 *   + paragraph/list: textAlign, listStyleType
 *   + link: target rỗng (bỏ cả mark nếu href rỗng)
 * - Xử lý cả dữ liệu đã nạp nhưng chưa chỉnh sửa trong phiên hiện tại.
 */
export function sanitizeCvContent(
  content: RichTextCVContentDocument,
): RichTextCVContentDocument {
  if (!content) return content;

  const cloned = structuredClone(content);

  const sanitizeDoc = (
    doc: CvTiptapDocument | undefined,
    defaultSize: number,
  ): CvTiptapDocument => {
    if (!doc) return createEmptyTiptapDocument(defaultSize);
    return sanitizeTiptapDocument(doc, defaultSize);
  };

  const { profile, sections } = cloned;

  if (profile) {
    profile.fullName = sanitizeDoc(profile.fullName, 24);
    profile.title = sanitizeDoc(profile.title, 15);
    profile.email = sanitizeDoc(profile.email, 12);
    profile.phone = sanitizeDoc(profile.phone, 12);
    profile.dob = sanitizeDoc(profile.dob, 12);
    profile.address = sanitizeDoc(profile.address, 12);
    profile.website = sanitizeDoc(profile.website, 12);
    profile.socialLink = sanitizeDoc(profile.socialLink, 12);
  }

  if (sections) {
    if (sections.objective) {
      sections.objective.title = sanitizeDoc(sections.objective.title, 14);
      sections.objective.content = sanitizeDoc(sections.objective.content, 13);
    }
    if (sections.interests) {
      sections.interests.title = sanitizeDoc(sections.interests.title, 14);
      sections.interests.content = sanitizeDoc(sections.interests.content, 13);
    }
    if (sections.additionalInfo) {
      sections.additionalInfo.title = sanitizeDoc(sections.additionalInfo.title, 14);
      sections.additionalInfo.content = sanitizeDoc(sections.additionalInfo.content, 13);
    }
    if (sections.experience) {
      sections.experience.title = sanitizeDoc(sections.experience.title, 14);
      sections.experience.items?.forEach((item) => {
        item.company = sanitizeDoc(item.company, 13);
        item.position = sanitizeDoc(item.position, 13);
        item.startDate = sanitizeDoc(item.startDate, 12);
        item.endDate = sanitizeDoc(item.endDate, 12);
        item.description = sanitizeDoc(item.description, 12);
      });
    }
    if (sections.education) {
      sections.education.title = sanitizeDoc(sections.education.title, 14);
      sections.education.items?.forEach((item) => {
        item.school = sanitizeDoc(item.school, 13);
        item.title = sanitizeDoc(item.title, 13);
        item.start = sanitizeDoc(item.start, 12);
        item.end = sanitizeDoc(item.end, 12);
        item.details = sanitizeDoc(item.details, 12);
      });
    }
    if (sections.skills) {
      sections.skills.title = sanitizeDoc(sections.skills.title, 14);
      sections.skills.items?.forEach((item) => {
        item.name = sanitizeDoc(item.name, 13);
        item.description = sanitizeDoc(item.description, 12);
      });
    }
    if (sections.projects) {
      sections.projects.title = sanitizeDoc(sections.projects.title, 14);
      sections.projects.items?.forEach((item) => {
        item.projectName = sanitizeDoc(item.projectName, 13);
        item.role = sanitizeDoc(item.role, 13);
        item.start = sanitizeDoc(item.start, 12);
        item.end = sanitizeDoc(item.end, 12);
        item.description = sanitizeDoc(item.description, 12);
      });
    }
    if (sections.certifications) {
      sections.certifications.title = sanitizeDoc(sections.certifications.title, 14);
      sections.certifications.items?.forEach((item) => {
        item.name = sanitizeDoc(item.name, 13);
        item.issueDate = sanitizeDoc(item.issueDate, 12);
      });
    }
    if (sections.awards) {
      sections.awards.title = sanitizeDoc(sections.awards.title, 14);
      sections.awards.items?.forEach((item) => {
        item.awardName = sanitizeDoc(item.awardName, 13);
        item.date = sanitizeDoc(item.date, 12);
      });
    }
  }

  return cloned;
}

/**
 * Giữ nguyên hàm normalizeCvContentFontSizes để tương thích với các module đang import,
 * đồng thời áp dụng luôn quy trình sanitize toàn diện qua sanitizeCvContent.
 */
export function normalizeCvContentFontSizes(
  content: RichTextCVContentDocument,
): RichTextCVContentDocument {
  return sanitizeCvContent(content);
}
