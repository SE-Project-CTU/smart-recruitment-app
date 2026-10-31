import { z } from "zod";
import type {
  CvDocumentAttrs,
  CvTiptapAttributeValue,
  CvTiptapDocument,
  CvTiptapMark,
  CvTiptapNode,
} from "@/types/cv";

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

const attributeValueSchema: z.ZodType<CvTiptapAttributeValue> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const attributesSchema = z.record(z.string(), attributeValueSchema);

const tiptapMarkSchema: z.ZodType<CvTiptapMark> = z.object({
  type: z.string().min(1),
  attrs: attributesSchema.optional(),
});

const tiptapNodeSchema: z.ZodType<CvTiptapNode> = z.lazy(() =>
  z.object({
    type: z.string().min(1),
    text: z.string().optional(),
    attrs: attributesSchema.optional(),
    marks: z.array(tiptapMarkSchema).optional(),
    content: z.array(tiptapNodeSchema).optional(),
  }),
);

const docAttributesSchema = z
  .object({
    fontSize: z
      .number({ required_error: "Cỡ chữ không được để trống" })
      .min(6, "Cỡ chữ tối thiểu là 6px")
      .max(96, "Cỡ chữ tối đa là 96px"),
  })
  .and(attributesSchema);

export const tiptapDocumentSchema: z.ZodType<CvTiptapDocument> = z.object({
  type: z.literal("doc"),
  attrs: docAttributesSchema as unknown as z.ZodType<CvDocumentAttrs>,
  content: z.array(tiptapNodeSchema),
}) as unknown as z.ZodType<CvTiptapDocument>;

export function extractTiptapText(node: CvTiptapNode): string {
  return `${node.text ?? ""}${node.content?.map(extractTiptapText).join("") ?? ""}`;
}

function richTextSchema(options: {
  label: string;
  maxLength: number;
  required?: boolean;
  email?: boolean;
  phone?: boolean;
}) {
  return tiptapDocumentSchema.superRefine((document, context) => {
    const value = extractTiptapText(document).trim();

    if (options.required && value.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${options.label} không được để trống`,
      });
      return;
    }

    if (value.length > options.maxLength) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${options.label} tối đa ${options.maxLength} ký tự`,
      });
    }

    if (
      options.email &&
      value &&
      !z.string().email().safeParse(value).success
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Định dạng email không hợp lệ",
      });
    }

    if (
      options.phone &&
      value &&
      !/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(value)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Số điện thoại Việt Nam không hợp lệ (0xxxxxxxxx hoặc +84xxxxxxxxx)",
      });
    }
  });
}

const defaultStyleSchema = z.object({
  fontFamily: z.string().min(1, "Font chữ không được để trống"),
  fontScale: z.number().min(0.5, "Tỉ lệ cỡ chữ tối thiểu là 50%").max(2.0, "Tỉ lệ cỡ chữ tối đa là 200%").default(1.0),
  primaryColors: z.array(z.string()).min(1, "Cần ít nhất một màu chủ đạo"),
  lineHeight: z.number().positive("Khoảng cách dòng phải là số dương"),
});

const metadataSchema = z.object({
  version: z.string().min(1),
  templateCode: z.string().min(1, "Template code không được để trống"),
  language: z.enum(["vi", "en"]),
  updatedAt: z.string().optional(),
  defaultStyle: defaultStyleSchema,
});

const profileSchema = z.object({
  fullName: richTextSchema({
    label: "Họ và tên",
    maxLength: 50,
    required: true,
  }),
  title: richTextSchema({ label: "Chức danh", maxLength: 50, required: true }),
  avatarUrl: z.string(),
  email: richTextSchema({
    label: "Email",
    maxLength: 50,
    required: true,
    email: true,
  }),
  phone: richTextSchema({
    label: "Số điện thoại",
    maxLength: 12,
    required: true,
    phone: true,
  }),
  dob: tiptapDocumentSchema,
  address: tiptapDocumentSchema,
  website: tiptapDocumentSchema,
  socialLink: tiptapDocumentSchema,
});

const sectionTitleSchema = richTextSchema({
  label: "Tiêu đề mục",
  maxLength: 100,
  required: true,
});
const shortRequiredRichText = (label: string, maxLength: number) =>
  richTextSchema({ label, maxLength, required: true });
const optionalRichText = (maxLength = 10_000) =>
  richTextSchema({ label: "Nội dung", maxLength });

const textSectionSchema = z.object({
  title: sectionTitleSchema,
  visible: z.boolean(),
  content: optionalRichText(),
});

function itemSectionSchema<TItem extends z.ZodTypeAny>(itemSchema: TItem) {
  return z.object({
    title: sectionTitleSchema,
    visible: z.boolean(),
    items: z.array(itemSchema),
  });
}

const experienceItemSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  company: shortRequiredRichText("Tên công ty", 50),
  position: shortRequiredRichText("Vị trí", 50),
  startDate: optionalRichText(50),
  endDate: optionalRichText(50),
  description: optionalRichText(),
});

const educationItemSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  school: shortRequiredRichText("Tên trường", 100),
  title: shortRequiredRichText("Chuyên ngành/bằng cấp", 100),
  start: optionalRichText(50),
  end: optionalRichText(50),
  details: optionalRichText(),
});

const skillItemSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  name: shortRequiredRichText("Tên kỹ năng", 100),
  description: optionalRichText(),
});

const projectItemSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  projectName: shortRequiredRichText("Tên dự án", 100),
  role: shortRequiredRichText("Vai trò", 50),
  start: optionalRichText(50),
  end: optionalRichText(50),
  description: optionalRichText(),
});

const certificationItemSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  name: shortRequiredRichText("Tên chứng chỉ", 100),
  issueDate: optionalRichText(50),
});

const awardItemSchema = z.object({
  id: z.string().min(1, "ID không được để trống"),
  awardName: shortRequiredRichText("Tên giải thưởng", 100),
  date: optionalRichText(50),
});

const sectionsSchema = z.object({
  order: z.array(z.enum(FIXED_SECTION_KEYS)).refine((order) => {
    const unique = new Set(order);
    return (
      unique.size === FIXED_SECTION_KEYS.length &&
      FIXED_SECTION_KEYS.every((key) => unique.has(key))
    );
  }, "Thứ tự phải chứa đủ 9 section, không trùng lặp"),
  objective: textSectionSchema,
  experience: itemSectionSchema(experienceItemSchema),
  education: itemSectionSchema(educationItemSchema),
  skills: itemSectionSchema(skillItemSchema),
  projects: itemSectionSchema(projectItemSchema),
  certifications: itemSectionSchema(certificationItemSchema),
  awards: itemSectionSchema(awardItemSchema),
  interests: textSectionSchema,
  additionalInfo: textSectionSchema,
});

const contentSchema = z.object({
  metadata: metadataSchema,
  profile: profileSchema,
  sections: sectionsSchema,
});

const layoutSchema = z
  .object({
    version: z.string().min(1),
    areas: z.array(
      z.object({
        id: z.string().min(1),
        sections: z.array(z.enum(FIXED_SECTION_KEYS)),
      }),
    ),
  })
  .superRefine((layout, context) => {
    const seen = new Set<string>();
    layout.areas.forEach((area, areaIndex) => {
      area.sections.forEach((sectionKey, sectionIndex) => {
        if (seen.has(sectionKey)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["areas", areaIndex, "sections", sectionIndex],
            message: "Một section không được xuất hiện ở nhiều area",
          });
        }
        seen.add(sectionKey);
      });
    });
  });

export const richTextCvEditorSchema = z
  .object({
    templateId: z.string().uuid("Template ID không hợp lệ"),
    title: z.string().trim().min(1, "Tiêu đề CV không được để trống").max(200),
    language: z.enum(["vi", "en"]),
    isPublic: z.boolean(),
    content: contentSchema,
    layout: layoutSchema,
  })
  .superRefine((data, context) => {
    const ids = new Map<string, string>();
    const itemSections = [
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "awards",
    ] as const;

    for (const sectionKey of itemSections) {
      data.content.sections[sectionKey].items.forEach((item, index) => {
        const prior = ids.get(item.id);
        if (prior) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["content", "sections", sectionKey, "items", index, "id"],
            message: `ID trùng với item tại ${prior}`,
          });
        } else {
          ids.set(item.id, `${sectionKey}[${index}]`);
        }
      });
    }
  });

export type RichTextCvEditorValues = z.infer<typeof richTextCvEditorSchema>;
