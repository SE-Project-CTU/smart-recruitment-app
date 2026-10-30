import { z } from "zod";

// Vietnamese phone number regex: starts with 0 or +84 followed by 9 digits
const VIETNAMESE_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

export const FIXED_SECTION_KEYS = [
  "objective",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "awards",
  "interests",
  "additionalInfo",
] as const;

export type FixedSectionKey = (typeof FIXED_SECTION_KEYS)[number];

// ==========================================
// 1. Content Schema
// ==========================================
export const cvDocumentMetadataSchema = z.object({
  version: z.string().default("1.0"),
  templateCode: z.string().min(1, "Template code is required"),
  language: z.enum(["vi", "en"]).default("vi"),
  updatedAt: z.string().optional(),
});

export const cvProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Họ và tên không được để trống")
    .max(50, "Họ và tên tối đa 50 ký tự"),
  title: z
    .string()
    .min(1, "Chức danh không được để trống")
    .max(50, "Chức danh tối đa 50 ký tự"),
  avatarUrl: z.string().default(""),
  email: z
    .string()
    .min(1, "Email không được để trống")
    .max(50, "Email tối đa 50 ký tự")
    .email("Định dạng email không hợp lệ"),
  phone: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .max(11, "Số điện thoại tối đa 11 ký tự")
    .regex(VIETNAMESE_PHONE_REGEX, "Số điện thoại Việt Nam không hợp lệ (0xxxxxxxxx hoặc +84xxxxxxxxx)"),
  dob: z.string().default(""),
  address: z.string().default(""),
  website: z.string().default(""),
  socialLink: z.string().default(""),
});

export const cvTextSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề mục không được để trống")
    .max(100, "Tiêu đề mục tối đa 100 ký tự"),
  visible: z.boolean().default(true),
  content: z.string().default(""),
});

// Items
export const cvExperienceItemSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  company: z
    .string()
    .min(1, "Tên công ty không được để trống")
    .max(50, "Tên công ty tối đa 50 ký tự"),
  position: z
    .string()
    .min(1, "Vị trí không được để trống")
    .max(50, "Vị trí tối đa 50 ký tự"),
  startDate: z.string().nullable().default(null),
  endDate: z.string().nullable().default(null),
  description: z.string().default(""),
});

export const cvEducationItemSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  school: z
    .string()
    .min(1, "Tên trường không được để trống")
    .max(100, "Tên trường tối đa 100 ký tự"),
  title: z
    .string()
    .min(1, "Chuyên ngành/bằng cấp không được để trống")
    .max(100, "Chuyên ngành/bằng cấp tối đa 100 ký tự"),
  start: z.string().nullable().default(null),
  end: z.string().nullable().default(null),
  details: z.string().default(""),
});

export const cvSkillItemSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  name: z
    .string()
    .min(1, "Tên kỹ năng không được để trống")
    .max(100, "Tên kỹ năng tối đa 100 ký tự"),
  description: z.string().default(""),
});

export const cvProjectItemSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  projectName: z
    .string()
    .min(1, "Tên dự án không được để trống")
    .max(100, "Tên dự án tối đa 100 ký tự"),
  role: z
    .string()
    .min(1, "Vai trò không được để trống")
    .max(50, "Vai trò tối đa 50 ký tự"),
  start: z.string().nullable().default(null),
  end: z.string().nullable().default(null),
  description: z.string().default(""),
});

export const cvCertificationItemSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  name: z
    .string()
    .min(1, "Tên chứng chỉ không được để trống")
    .max(100, "Tên chứng chỉ tối đa 100 ký tự"),
  issueDate: z.string().nullable().default(null),
});

export const cvAwardItemSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  awardName: z
    .string()
    .min(1, "Tên giải thưởng không được để trống")
    .max(100, "Tên giải thưởng tối đa 100 ký tự"),
  date: z.string().nullable().default(null),
});

export function createItemSectionSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    title: z
      .string()
      .min(1, "Tiêu đề không được để trống")
      .max(100, "Tiêu đề tối đa 100 ký tự"),
    visible: z.boolean().default(true),
    items: z.array(itemSchema).default([]),
  });
}

export const cvSectionsSchema = z.object({
  order: z.array(z.string()).refine((arr) => {
    // Phải chứa đầy đủ các section key cố định và không trùng lặp
    const set = new Set(arr);
    return (
      set.size === arr.length &&
      FIXED_SECTION_KEYS.every((key) => set.has(key))
    );
  }, "Thứ tự order phải bao gồm đầy đủ và duy nhất 9 mục chuẩn của CV"),
  objective: cvTextSectionSchema,
  experience: createItemSectionSchema(cvExperienceItemSchema),
  education: createItemSectionSchema(cvEducationItemSchema),
  skills: createItemSectionSchema(cvSkillItemSchema),
  projects: createItemSectionSchema(cvProjectItemSchema),
  certifications: createItemSectionSchema(cvCertificationItemSchema),
  awards: createItemSectionSchema(cvAwardItemSchema),
  interests: cvTextSectionSchema,
  additionalInfo: cvTextSectionSchema,
});

export const cvContentDocumentSchema = z.object({
  metadata: cvDocumentMetadataSchema,
  profile: cvProfileSchema,
  sections: cvSectionsSchema,
});

// ==========================================
// 2. Layout Schema
// ==========================================
export const cvLayoutAreaSchema = z.object({
  id: z.string().min(1, "Area ID is required"),
  sections: z.array(z.string()),
});

export const cvLayoutDocumentSchema = z
  .object({
    version: z.string().default("1.0"),
    areas: z.array(cvLayoutAreaSchema),
  })
  .refine((layout) => {
    // Invariant: Mỗi section chỉ được xuất hiện ở tối đa 1 area duy nhất
    const assignedSections = new Set<string>();
    for (const area of layout.areas) {
      for (const sec of area.sections) {
        if (assignedSections.has(sec)) {
          return false;
        }
        assignedSections.add(sec);
      }
    }
    return true;
  }, {
    message: "Một section không được xuất hiện ở nhiều area khác nhau",
    path: ["areas"],
  });

// ==========================================
// 3. Presentation Schema
// ==========================================
export const cvGlobalStyleSchema = z.object({
  fontFamily: z.string().min(1, "Font chữ không được để trống"),
  fontScale: z.number().min(0.5).max(2.0).default(1.0),
  baseFontSize: z.number().optional(),
  primaryColor: z.array(z.string()).min(1, "Màu chủ đạo không được để trống"),
  lineHeight: z.number().positive("Khoảng cách dòng phải là số dương"),
});

export const cvFieldStyleSchema = z.object({
  color: z.string().optional(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.string().optional(),
  fontStyle: z.string().optional(),
  textDecoration: z.string().optional(),
  textAlign: z.enum(["left", "center", "right", "justify"]).nullable().optional(),
  listStyle: z.enum(["disc", "circle", "square", "decimal", "none"]).nullable().optional(),
});

export const cvPresentationMetadataSchema = z.object({
  version: z.string().default("1.0"),
  templateCode: z.string().min(1, "Template code is required"),
  updatedAt: z.string().optional(),
});

export const cvPresentationDocumentSchema = z.object({
  metadata: cvPresentationMetadataSchema,
  styles: z.object({
    global: cvGlobalStyleSchema,
    fields: z.record(z.string(), cvFieldStyleSchema).default({}),
  }),
});

// ==========================================
// 4. Root CvEditorValues Schema (Full Invariant Refinements)
// ==========================================
export const cvEditorSchema = z
  .object({
    templateId: z.string().uuid("Template ID không hợp lệ"),
    title: z
      .string()
      .trim()
      .min(1, "Tiêu đề CV không được để trống")
      .max(200, "Tiêu đề CV tối đa 200 ký tự"),
    language: z.enum(["vi", "en"]),
    isPublic: z.boolean().default(false),
    content: cvContentDocumentSchema,
    layout: cvLayoutDocumentSchema,
    presentation: cvPresentationDocumentSchema,
  })
  .superRefine((data, ctx) => {
    // 1. Kiểm tra ID của các item trong từng section không được rỗng và phải duy nhất toàn cục
    const seenIds = new Map<string, string>(); // id -> path
    const checkItemIds = (items: Array<{ id: string }>, sectionPath: string) => {
      items.forEach((item, index) => {
        if (!item.id || item.id.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "ID của item không được để trống",
            path: ["content", "sections", sectionPath, "items", index, "id"],
          });
          return;
        }
        if (seenIds.has(item.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `ID trùng lặp: ${item.id} đã được dùng tại ${seenIds.get(item.id)}`,
            path: ["content", "sections", sectionPath, "items", index, "id"],
          });
        } else {
          seenIds.set(item.id, `${sectionPath}[${index}]`);
        }
      });
    };

    checkItemIds(data.content.sections.experience.items, "experience");
    checkItemIds(data.content.sections.education.items, "education");
    checkItemIds(data.content.sections.skills.items, "skills");
    checkItemIds(data.content.sections.projects.items, "projects");
    checkItemIds(data.content.sections.certifications.items, "certifications");
    checkItemIds(data.content.sections.awards.items, "awards");

    // 2. Invariant: dynamic style key trong presentation.styles.fields không được mồ côi
    // Các key động có dạng: `{itemId}.{property}` (ví dụ: `exp_01.position`, `edu_01.school`)
    // Hoặc các key tĩnh như: `profile.{prop}`, `sections.{sectionKey}.{prop}`
    const fields = data.presentation.styles.fields || {};
    for (const key of Object.keys(fields)) {
      if (key.startsWith("profile.") || key.startsWith("sections.")) {
        continue;
      }
      // Dạng itemId.property
      const dotIndex = key.indexOf(".");
      if (dotIndex > 0) {
        const itemId = key.substring(0, dotIndex);
        if (!seenIds.has(itemId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Style key mồ côi: Item '${itemId}' không còn tồn tại trong CV`,
            path: ["presentation", "styles", "fields", key],
          });
        }
      }
    }
  });

export type CvEditorValues = z.infer<typeof cvEditorSchema>;
