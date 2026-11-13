import type { CvTiptapDocument, CvTiptapNode } from "@/types/cv";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";
import type { PreparedCvSection } from "../components/assistant/types";

/**
 * Trích xuất văn bản thuần tuý (plain text) từ cấu trúc Tiptap Document hoặc Node
 * Đảm bảo các dòng/đoạn paragraph được phân tách bằng khoảng trắng hợp lý
 */
export function extractPlainTextFromTiptap(
  node?: CvTiptapDocument | CvTiptapNode | null,
): string {
  if (!node) return "";

  if (node.type === "text") {
    return node.text ?? "";
  }

  if (Array.isArray(node.content)) {
    const parts = node.content
      .map(extractPlainTextFromTiptap)
      .map((s) => s.trim())
      .filter(Boolean);

    // Nếu là danh sách hoặc tài liệu gốc, nối bằng dòng mới hoặc khoảng trắng
    if (node.type === "bulletList" || node.type === "orderedList") {
      return parts.join("\n");
    }
    if (node.type === "doc") {
      return parts.join("\n");
    }
    return parts.join(" ");
  }

  return "";
}

/**
 * Trích xuất văn bản có cấu trúc và định dạng từ Tiptap:
 * - Bảo tồn 100% ngắt dòng giữa các paragraph
 * - Giữ các dấu gạch đầu dòng (•) của bulletList
 * - Giữ số thứ tự của orderedList (1., 2., ...)
 */
export function extractFormattedTextFromTiptap(
  node?: CvTiptapDocument | CvTiptapNode | null,
): string {
  if (!node) return "";

  if (node.type === "text") {
    return node.text ?? "";
  }

  if (Array.isArray(node.content)) {
    if (node.type === "bulletList") {
      return node.content
        .map((item) => {
          const itemText = extractFormattedTextFromTiptap(item).trim();
          return itemText ? `- ${itemText}` : "";
        })
        .filter(Boolean)
        .join("\n");
    }

    if (node.type === "orderedList") {
      return node.content
        .map((item, idx) => {
          const itemText = extractFormattedTextFromTiptap(item).trim();
          return itemText ? `${idx + 1}. ${itemText}` : "";
        })
        .filter(Boolean)
        .join("\n");
    }

    if (node.type === "listItem" || node.type === "paragraph") {
      return node.content
        .map(extractFormattedTextFromTiptap)
        .join("")
        .trim();
    }

    if (node.type === "doc") {
      return node.content
        .map(extractFormattedTextFromTiptap)
        .map((s) => s.trim())
        .filter(Boolean)
        .join("\n");
    }

    return node.content.map(extractFormattedTextFromTiptap).join(" ");
  }

  return "";
}

function getSectionTitle(
  title: CvTiptapDocument | CvTiptapNode | null | undefined,
  fallback: string,
): string {
  return extractPlainTextFromTiptap(title).trim() || fallback;
}

/**
 * Gom tất cả các item trong cùng một Section thành MỘT chuỗi content có cấu trúc,
 * giữ ranh giới rõ ràng giữa các item để gửi lên AI batching API (POST /api/v1/ai/cv/enhance/batch).
 * Bỏ qua các section rỗng hoặc bị ẩn.
 */
export function prepareCvSectionsForEnhanceBatch(
  values?: Partial<RichTextCvEditorValues> | null,
): PreparedCvSection[] {
  if (!values?.content) return [];

  const { sections } = values.content;
  const result: PreparedCvSection[] = [];

  // 1. MỤC TIÊU NGHỀ NGHIỆP (OBJECTIVE)
  if (sections?.objective?.visible !== false) {
    const text = extractFormattedTextFromTiptap(sections?.objective?.content);
    if (text.trim()) {
      result.push({
        sectionType: "OBJECTIVE",
        sectionTitle: getSectionTitle(sections.objective.title, "Mục tiêu nghề nghiệp"),
        sectionKey: "objective",
        content: text.trim(),
      });
    }
  }

  // 2. KINH NGHIỆM LÀM VIỆC (EXPERIENCE)
  if (
    sections?.experience?.visible !== false &&
    sections?.experience?.items?.length
  ) {
    const expBlocks: string[] = [];
    sections.experience.items.forEach((item, index) => {
      const position = extractFormattedTextFromTiptap(item.position);
      const company = extractFormattedTextFromTiptap(item.company);
      const start = extractFormattedTextFromTiptap(item.startDate);
      const end = extractFormattedTextFromTiptap(item.endDate);
      const desc = extractFormattedTextFromTiptap(item.description);

      const header = [
        `[Kinh nghiệm ${index + 1}]`,
        position,
        company ? `tại ${company}` : "",
        start || end ? `(${start || ""} - ${end || "Hiện tại"})` : "",
      ]
        .filter(Boolean)
        .join(" ");

      const blockLines = [header];
      if (desc.trim()) {
        blockLines.push(desc.trim());
      }

      if (blockLines.length > 0 && (position || company || desc)) {
        expBlocks.push(blockLines.join("\n"));
      }
    });

    if (expBlocks.length > 0) {
      result.push({
        sectionType: "EXPERIENCE",
        sectionTitle: getSectionTitle(sections.experience.title, "Kinh nghiệm làm việc"),
        sectionKey: "experience",
        content: expBlocks.join("\n\n---\n\n"),
      });
    }
  }

  // 3. KỸ NĂNG CHUYÊN MÔN (SKILLS)
  if (sections?.skills?.visible !== false && sections?.skills?.items?.length) {
    const skillLines: string[] = [];
    sections.skills.items.forEach((item) => {
      const name = extractFormattedTextFromTiptap(item.name);
      const desc = extractFormattedTextFromTiptap(item.description);
      if (name.trim()) {
        skillLines.push(desc.trim() ? `• ${name.trim()} (${desc.trim()})` : `• ${name.trim()}`);
      }
    });

    if (skillLines.length > 0) {
      result.push({
        sectionType: "SKILLS",
        sectionTitle: getSectionTitle(sections.skills.title, "Kỹ năng chuyên môn"),
        sectionKey: "skills",
        content: skillLines.join("\n"),
      });
    }
  }

  // 4. DỰ ÁN TIÊU BIỂU (PROJECTS)
  if (
    sections?.projects?.visible !== false &&
    sections?.projects?.items?.length
  ) {
    const projectBlocks: string[] = [];
    sections.projects.items.forEach((item, index) => {
      const projectName = extractFormattedTextFromTiptap(item.projectName);
      const role = extractFormattedTextFromTiptap(item.role);
      const start = extractFormattedTextFromTiptap(item.start);
      const end = extractFormattedTextFromTiptap(item.end);
      const desc = extractFormattedTextFromTiptap(item.description);

      const header = [
        `[Dự án ${index + 1}]`,
        projectName,
        role ? `- Vai trò: ${role}` : "",
        start || end ? `(${start || ""} - ${end || "Hiện tại"})` : "",
      ]
        .filter(Boolean)
        .join(" ");

      const lines = [header];
      if (desc.trim()) {
        lines.push(desc.trim());
      }

      if (lines.length > 0 && (projectName || role || desc)) {
        projectBlocks.push(lines.join("\n"));
      }
    });

    if (projectBlocks.length > 0) {
      result.push({
        sectionType: "PROJECTS",
        sectionTitle: getSectionTitle(sections.projects.title, "Dự án tiêu biểu"),
        sectionKey: "projects",
        content: projectBlocks.join("\n\n---\n\n"),
      });
    }
  }

  // 5. HỌC VẤN (EDUCATION)
  if (
    sections?.education?.visible !== false &&
    sections?.education?.items?.length
  ) {
    const eduBlocks: string[] = [];
    sections.education.items.forEach((item, index) => {
      const school = extractFormattedTextFromTiptap(item.school);
      const title = extractFormattedTextFromTiptap(item.title);
      const start = extractFormattedTextFromTiptap(item.start);
      const end = extractFormattedTextFromTiptap(item.end);
      const details = extractFormattedTextFromTiptap(item.details);

      const header = [
        `[Học vấn ${index + 1}]`,
        title,
        school ? `tại ${school}` : "",
        start || end ? `(${start || ""} - ${end || ""})` : "",
      ]
        .filter(Boolean)
        .join(" ");

      const lines = [header];
      if (details.trim()) {
        lines.push(details.trim());
      }

      if (lines.length > 0 && (school || title || details)) {
        eduBlocks.push(lines.join("\n"));
      }
    });

    if (eduBlocks.length > 0) {
      result.push({
        sectionType: "EDUCATION",
        sectionTitle: getSectionTitle(sections.education.title, "Học vấn"),
        sectionKey: "education",
        content: eduBlocks.join("\n\n---\n\n"),
      });
    }
  }

  // 6. CHỨNG CHỈ (CERTIFICATIONS)
  if (
    sections?.certifications?.visible !== false &&
    sections?.certifications?.items?.length
  ) {
    const certLines: string[] = [];
    sections.certifications.items.forEach((item) => {
      const name = extractFormattedTextFromTiptap(item.name);
      const issueDate = extractFormattedTextFromTiptap(item.issueDate);
      if (name.trim()) {
        certLines.push(issueDate.trim() ? `• ${name.trim()} (${issueDate.trim()})` : `• ${name.trim()}`);
      }
    });

    if (certLines.length > 0) {
      result.push({
        sectionType: "CERTIFICATIONS",
        sectionTitle: getSectionTitle(sections.certifications.title, "Chứng chỉ"),
        sectionKey: "certifications",
        content: certLines.join("\n"),
      });
    }
  }

  // 7. GIẢI THƯỞNG (AWARDS)
  if (sections?.awards?.visible !== false && sections?.awards?.items?.length) {
    const awardLines: string[] = [];
    sections.awards.items.forEach((item) => {
      const name = extractFormattedTextFromTiptap(item.awardName);
      const date = extractFormattedTextFromTiptap(item.date);
      if (name.trim()) {
        awardLines.push(date.trim() ? `• ${name.trim()} (${date.trim()})` : `• ${name.trim()}`);
      }
    });

    if (awardLines.length > 0) {
      result.push({
        sectionType: "AWARDS",
        sectionTitle: getSectionTitle(sections.awards.title, "Giải thưởng"),
        sectionKey: "awards",
        content: awardLines.join("\n"),
      });
    }
  }

  return result;
}

/**
 * Chuyển đổi dữ liệu form CV từ Tiptap sang văn bản có cấu trúc rõ ràng
 * theo các nhãn chuẩn hoá mà Backend SmartHire Match Engine nhận diện được:
 * - "Vị trí mục tiêu:"
 * - "Mục tiêu nghề nghiệp:"
 * - "Kỹ năng:"
 * - "Kinh nghiệm làm việc:" (chứa ngày tháng bắt đầu - kết thúc)
 * - "Dự án:"
 * - "Học vấn:"
 */
export function convertCvFormToPlainText(
  values?: Partial<RichTextCvEditorValues> | null,
): string {
  if (!values?.content) return "";

  const { content, title: cvTitle } = values;
  const { profile, sections } = content;
  const lines: string[] = [];

  // 1. VỊ TRÍ MỤC TIÊU / CHỨC DANH
  const targetTitle =
    extractPlainTextFromTiptap(profile?.title) || cvTitle?.trim() || "";
  if (targetTitle) {
    lines.push(`Vị trí mục tiêu: ${targetTitle}`);
    lines.push("");
  }

  // 2. MỤC TIÊU NGHỀ NGHIỆP
  if (sections?.objective?.visible !== false) {
    const objectiveText = extractPlainTextFromTiptap(sections?.objective?.content);
    if (objectiveText) {
      lines.push("Mục tiêu nghề nghiệp:");
      lines.push(objectiveText);
      lines.push("");
    }
  }

  // 3. KỸ NĂNG CHUYÊN MÔN
  if (sections?.skills?.visible !== false && sections?.skills?.items?.length) {
    const skillLines: string[] = [];
    for (const item of sections.skills.items) {
      const name = extractPlainTextFromTiptap(item.name);
      const desc = extractPlainTextFromTiptap(item.description);
      if (name) {
        skillLines.push(desc ? `${name} (${desc})` : name);
      }
    }

    if (skillLines.length > 0) {
      lines.push("Kỹ năng:");
      skillLines.forEach((sk) => lines.push(sk));
      lines.push("");
    }
  }

  // 4. KINH NGHIỆM LÀM VIỆC
  if (
    sections?.experience?.visible !== false &&
    sections?.experience?.items?.length
  ) {
    const expLines: string[] = [];
    for (const item of sections.experience.items) {
      const company = extractPlainTextFromTiptap(item.company);
      const position = extractPlainTextFromTiptap(item.position);
      const startDate = extractPlainTextFromTiptap(item.startDate);
      const endDate = extractPlainTextFromTiptap(item.endDate);
      const description = extractPlainTextFromTiptap(item.description);

      const parts: string[] = [];
      const hasDate = Boolean(startDate || endDate);

      if (hasDate) {
        const start = startDate || "01/2020";
        const end = endDate || "Hiện tại";
        parts.push(`${start} - ${end}:`);
      }

      if (position && company) {
        parts.push(`${position} tại ${company}.`);
      } else if (position || company) {
        parts.push(`${position || company}.`);
      }

      if (description) {
        parts.push(description);
      }

      if (parts.length > 0) {
        expLines.push(parts.join(" "));
      }
    }

    if (expLines.length > 0) {
      lines.push("Kinh nghiệm làm việc:");
      expLines.forEach((exp) => lines.push(exp));
      lines.push("");
    }
  }

  // 5. DỰ ÁN TIÊU BIỂU
  if (
    sections?.projects?.visible !== false &&
    sections?.projects?.items?.length
  ) {
    const projectLines: string[] = [];
    for (const item of sections.projects.items) {
      const projectName = extractPlainTextFromTiptap(item.projectName);
      const role = extractPlainTextFromTiptap(item.role);
      const start = extractPlainTextFromTiptap(item.start);
      const end = extractPlainTextFromTiptap(item.end);
      const description = extractPlainTextFromTiptap(item.description);

      const parts: string[] = [];
      if (projectName) parts.push(`Dự án ${projectName}`);
      if (role) parts.push(`- Vai trò: ${role}`);
      if (start || end) parts.push(`(${start || ""} - ${end || "Hiện tại"})`);
      if (description) parts.push(`: ${description}`);

      if (parts.length > 0) {
        projectLines.push(parts.join(" "));
      }
    }

    if (projectLines.length > 0) {
      lines.push("Dự án:");
      projectLines.forEach((prj) => lines.push(prj));
      lines.push("");
    }
  }

  // 6. HỌC VẤN
  if (
    sections?.education?.visible !== false &&
    sections?.education?.items?.length
  ) {
    const eduLines: string[] = [];
    for (const item of sections.education.items) {
      const school = extractPlainTextFromTiptap(item.school);
      const title = extractPlainTextFromTiptap(item.title);
      const details = extractPlainTextFromTiptap(item.details);

      const parts: string[] = [];
      if (title && school) {
        parts.push(`${title} tại ${school}.`);
      } else if (title || school) {
        parts.push(`${title || school}.`);
      }
      if (details) parts.push(details);

      if (parts.length > 0) {
        eduLines.push(parts.join(" "));
      }
    }

    if (eduLines.length > 0) {
      lines.push("Học vấn:");
      eduLines.forEach((edu) => lines.push(edu));
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}

/**
 * Kiểm tra xem CV hiện tại có đủ dữ liệu tối thiểu để gợi ý việc làm không
 */
export function isCvPlainTextEmpty(cvText: string): boolean {
  if (!cvText || cvText.trim().length < 15) return true;
  const lower = cvText.toLowerCase();
  const hasRole =
    lower.includes("vị trí mục tiêu:") &&
    lower.split("vị trí mục tiêu:")[1]?.trim().length > 2;
  const hasSkills =
    lower.includes("kỹ năng:") &&
    lower.split("kỹ năng:")[1]?.trim().length > 2;
  const hasExperience =
    lower.includes("kinh nghiệm làm việc:") &&
    lower.split("kinh nghiệm làm việc:")[1]?.trim().length > 2;

  return !hasRole && !hasSkills && !hasExperience;
}
