import type { CVDetail } from "@/types/cv";
import type { CvEditorValues } from "../schema/cvSchema";

/**
 * Khởi tạo dữ liệu form CvEditorValues từ CVDetail (nhận từ API hoặc mock data)
 * Loại bỏ các trường chỉ do server quản lý (id, candidateId, createdAt, updatedAt, previewFile)
 */
export function buildInitialCvEditorValues(detail: CVDetail): CvEditorValues {
  return {
    templateId: detail.templateId,
    title: detail.title,
    language: detail.language === "en" ? "en" : "vi",
    isPublic: detail.isPublic ?? false,
    content: {
      metadata: {
        version: detail.content.metadata.version || "1.0",
        templateCode: detail.content.metadata.templateCode || detail.template?.code || "modern_two_column",
        language: detail.content.metadata.language === "en" ? "en" : "vi",
        updatedAt: detail.content.metadata.updatedAt,
      },
      profile: {
        fullName: detail.content.profile.fullName || "",
        title: detail.content.profile.title || "",
        avatarUrl: detail.content.profile.avatarUrl || "",
        email: detail.content.profile.email || "",
        phone: detail.content.profile.phone || "",
        dob: detail.content.profile.dob || "",
        address: detail.content.profile.address || "",
        website: detail.content.profile.website || "",
        socialLink: detail.content.profile.socialLink || "",
      },
      sections: {
        order: [...(detail.content.sections.order || [])],
        objective: {
          title: detail.content.sections.objective.title || "Mục tiêu nghề nghiệp",
          visible: detail.content.sections.objective.visible ?? true,
          content: detail.content.sections.objective.content || "",
        },
        experience: {
          title: detail.content.sections.experience.title || "Kinh nghiệm làm việc",
          visible: detail.content.sections.experience.visible ?? true,
          items: (detail.content.sections.experience.items || []).map((item) => ({
            id: item.id,
            company: item.company,
            position: item.position,
            startDate: item.startDate ?? null,
            endDate: item.endDate ?? null,
            description: item.description || "",
          })),
        },
        education: {
          title: detail.content.sections.education.title || "Học vấn",
          visible: detail.content.sections.education.visible ?? true,
          items: (detail.content.sections.education.items || []).map((item) => ({
            id: item.id,
            school: item.school,
            title: item.title,
            start: item.start ?? null,
            end: item.end ?? null,
            details: item.details || "",
          })),
        },
        skills: {
          title: detail.content.sections.skills.title || "Kỹ năng chuyên môn",
          visible: detail.content.sections.skills.visible ?? true,
          items: (detail.content.sections.skills.items || []).map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description || "",
          })),
        },
        projects: {
          title: detail.content.sections.projects.title || "Dự án nổi bật",
          visible: detail.content.sections.projects.visible ?? true,
          items: (detail.content.sections.projects.items || []).map((item) => ({
            id: item.id,
            projectName: item.projectName,
            role: item.role,
            start: item.start ?? null,
            end: item.end ?? null,
            description: item.description || "",
          })),
        },
        certifications: {
          title: detail.content.sections.certifications.title || "Chứng chỉ",
          visible: detail.content.sections.certifications.visible ?? true,
          items: (detail.content.sections.certifications.items || []).map((item) => ({
            id: item.id,
            name: item.name,
            issueDate: item.issueDate ?? null,
          })),
        },
        awards: {
          title: detail.content.sections.awards.title || "Giải thưởng",
          visible: detail.content.sections.awards.visible ?? true,
          items: (detail.content.sections.awards.items || []).map((item) => ({
            id: item.id,
            awardName: item.awardName,
            date: item.date ?? null,
          })),
        },
        interests: {
          title: detail.content.sections.interests.title || "Sở thích",
          visible: detail.content.sections.interests.visible ?? true,
          content: detail.content.sections.interests.content || "",
        },
        additionalInfo: {
          title: detail.content.sections.additionalInfo.title || "Thông tin bổ sung",
          visible: detail.content.sections.additionalInfo.visible ?? true,
          content: detail.content.sections.additionalInfo.content || "",
        },
      },
    },
    layout: {
      version: detail.layout.version || "1.0",
      areas: (detail.layout.areas || []).map((area) => ({
        id: area.id,
        sections: [...area.sections],
      })),
    },
    presentation: {
      metadata: {
        version: detail.presentation.metadata.version || "1.0",
        templateCode: detail.presentation.metadata.templateCode || detail.template?.code || "modern_two_column",
        updatedAt: detail.presentation.metadata.updatedAt,
      },
      styles: {
        global: {
          fontFamily: detail.presentation.styles.global.fontFamily || "inter",
          baseFontSize: detail.presentation.styles.global.baseFontSize || 14,
          primaryColor: [...(detail.presentation.styles.global.primaryColor || ["#0F172A"])],
          lineHeight: detail.presentation.styles.global.lineHeight || 1.5,
        },
        fields: { ...(detail.presentation.styles.fields || {}) },
      },
    },
  };
}
