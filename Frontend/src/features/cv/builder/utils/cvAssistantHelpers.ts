import type { CvTiptapDocument, CvTiptapNode } from "@/types/cv";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";

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
  // Backend MatchEngine hỗ trợ bóc tách ngày tháng qua regex:
  // (\d{2}/\d{4}|\d{4})\s*[-–—]\s*(\d{2}/\d{4}|\d{4}|hiện tại|present|now)
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
  // Phải có ít nhất thông tin kỹ năng hoặc kinh nghiệm hoặc chức danh
  const lower = cvText.toLowerCase();
  const hasRole = lower.includes("vị trí mục tiêu:") && lower.split("vị trí mục tiêu:")[1]?.trim().length > 2;
  const hasSkills = lower.includes("kỹ năng:") && lower.split("kỹ năng:")[1]?.trim().length > 2;
  const hasExperience = lower.includes("kinh nghiệm làm việc:") && lower.split("kinh nghiệm làm việc:")[1]?.trim().length > 2;

  return !hasRole && !hasSkills && !hasExperience;
}
