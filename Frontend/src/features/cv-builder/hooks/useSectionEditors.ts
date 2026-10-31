import { useFieldArray, useFormContext } from "react-hook-form";
import type { RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";
import {
  createEmptyTiptapDocument,
  createBulletListDocument,
} from "@/features/cv-builder/utils/tiptapJson";
import type {
  SectionItemEditorActions,
  CvSectionEditorsMap,
} from "@/components/pages/cv-builder/templates/CvTemplateProps";

/**
 * Hook chỉnh sửa danh sách Kinh nghiệm làm việc (Experience)
 */
export function useExperienceSectionEditor(): SectionItemEditorActions {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const { insert, remove, move } = useFieldArray({
    control,
    name: "content.sections.experience.items",
    keyName: "_fieldKey",
  });

  return {
    onAddAfter: (index: number) =>
      insert(index + 1, {
        id: `exp_${crypto.randomUUID()}`,
        company: createEmptyTiptapDocument(),
        position: createEmptyTiptapDocument(),
        startDate: createEmptyTiptapDocument(),
        endDate: createEmptyTiptapDocument(),
        description: createBulletListDocument(),
      }),
    onDelete: (index: number) => remove(index),
    onMoveUp: (index: number) => move(index, index - 1),
    onMoveDown: (index: number) => move(index, index + 1),
  };
}

/**
 * Hook chỉnh sửa danh sách Học vấn (Education)
 */
export function useEducationSectionEditor(): SectionItemEditorActions {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const { insert, remove, move } = useFieldArray({
    control,
    name: "content.sections.education.items",
    keyName: "_fieldKey",
  });

  return {
    onAddAfter: (index: number) =>
      insert(index + 1, {
        id: `edu_${crypto.randomUUID()}`,
        school: createEmptyTiptapDocument(),
        title: createEmptyTiptapDocument(),
        start: createEmptyTiptapDocument(),
        end: createEmptyTiptapDocument(),
        details: createEmptyTiptapDocument(),
      }),
    onDelete: (index: number) => remove(index),
    onMoveUp: (index: number) => move(index, index - 1),
    onMoveDown: (index: number) => move(index, index + 1),
  };
}

/**
 * Hook chỉnh sửa danh sách Kỹ năng (Skills)
 */
export function useSkillsSectionEditor(): SectionItemEditorActions {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const { insert, remove, move } = useFieldArray({
    control,
    name: "content.sections.skills.items",
    keyName: "_fieldKey",
  });

  return {
    onAddAfter: (index: number) =>
      insert(index + 1, {
        id: `sk_${crypto.randomUUID()}`,
        name: createEmptyTiptapDocument(),
        description: createEmptyTiptapDocument(),
      }),
    onDelete: (index: number) => remove(index),
    onMoveUp: (index: number) => move(index, index - 1),
    onMoveDown: (index: number) => move(index, index + 1),
  };
}

/**
 * Hook chỉnh sửa danh sách Dự án (Projects)
 */
export function useProjectsSectionEditor(): SectionItemEditorActions {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const { insert, remove, move } = useFieldArray({
    control,
    name: "content.sections.projects.items",
    keyName: "_fieldKey",
  });

  return {
    onAddAfter: (index: number) =>
      insert(index + 1, {
        id: `prj_${crypto.randomUUID()}`,
        projectName: createEmptyTiptapDocument(),
        role: createEmptyTiptapDocument(),
        start: createEmptyTiptapDocument(),
        end: createEmptyTiptapDocument(),
        description: createBulletListDocument(),
      }),
    onDelete: (index: number) => remove(index),
    onMoveUp: (index: number) => move(index, index - 1),
    onMoveDown: (index: number) => move(index, index + 1),
  };
}

/**
 * Hook chỉnh sửa danh sách Chứng chỉ (Certifications)
 */
export function useCertificationsSectionEditor(): SectionItemEditorActions {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const { insert, remove, move } = useFieldArray({
    control,
    name: "content.sections.certifications.items",
    keyName: "_fieldKey",
  });

  return {
    onAddAfter: (index: number) =>
      insert(index + 1, {
        id: `cert_${crypto.randomUUID()}`,
        name: createEmptyTiptapDocument(),
        issueDate: createEmptyTiptapDocument(),
      }),
    onDelete: (index: number) => remove(index),
    onMoveUp: (index: number) => move(index, index - 1),
    onMoveDown: (index: number) => move(index, index + 1),
  };
}

/**
 * Hook chỉnh sửa danh sách Giải thưởng (Awards)
 */
export function useAwardsSectionEditor(): SectionItemEditorActions {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const { insert, remove, move } = useFieldArray({
    control,
    name: "content.sections.awards.items",
    keyName: "_fieldKey",
  });

  return {
    onAddAfter: (index: number) =>
      insert(index + 1, {
        id: `award_${crypto.randomUUID()}`,
        awardName: createEmptyTiptapDocument(),
        date: createEmptyTiptapDocument(),
      }),
    onDelete: (index: number) => remove(index),
    onMoveUp: (index: number) => move(index, index - 1),
    onMoveDown: (index: number) => move(index, index + 1),
  };
}

/**
 * Hook tổng hợp tất cả các Section Editors dùng trong Builder Adapter
 */
export function useCvSectionEditors(): CvSectionEditorsMap {
  const experience = useExperienceSectionEditor();
  const education = useEducationSectionEditor();
  const skills = useSkillsSectionEditor();
  const projects = useProjectsSectionEditor();
  const certifications = useCertificationsSectionEditor();
  const awards = useAwardsSectionEditor();

  return {
    experience,
    education,
    skills,
    projects,
    certifications,
    awards,
  };
}
