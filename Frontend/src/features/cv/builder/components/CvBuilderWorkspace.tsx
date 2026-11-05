import { useMemo, type Ref } from "react";
import { useFormContext, useWatch, type FieldPath } from "react-hook-form";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";
import { TiptapField } from "./TiptapField";
import { useCvMutations } from "../hooks/useCvMutations";
import { useCvSectionEditors } from "../hooks/useSectionEditors";
import type { CvFieldRenderer } from "../../templates/types";
import type { CvTemplateCode, RichTextCVContentDocument } from "@/types/cv";
import { TEMPLATE_REGISTRY, validateCvLayout } from "../../templates/registry";
import { ensureValidLayout } from "../utils/richTextInitialValues";

interface CvBuilderWorkspaceProps {
  contentRef?: Ref<HTMLDivElement>;
  className?: string;
  isReadOnly?: boolean;
  zoom?: number;
}

export default function CvBuilderWorkspace({
  contentRef,
  className = "",
  isReadOnly = false,
  zoom = 1.0,
}: CvBuilderWorkspaceProps) {
  const { control, getValues } = useFormContext<RichTextCvEditorValues>();

  // Thu hẹp subscription: Chỉ watch các trường ảnh hưởng đến cấu trúc hoặc giao diện template
  const watchedTemplateCode = useWatch({
    control,
    name: "content.metadata.templateCode",
  });
  const watchedDefaultStyle = useWatch({
    control,
    name: "content.metadata.defaultStyle",
  });
  const watchedLayout = useWatch({
    control,
    name: "layout",
  });
  const watchedLayoutAreas = useWatch({
    control,
    name: "layout.areas",
  });
  const watchedAvatarUrl = useWatch({
    control,
    name: "content.profile.avatarUrl",
  });

  // Theo dõi trạng thái hiển thị (visible) của từng section
  const watchedVisibility = useWatch({
    control,
    name: [
      "content.sections.objective.visible",
      "content.sections.experience.visible",
      "content.sections.education.visible",
      "content.sections.skills.visible",
      "content.sections.projects.visible",
      "content.sections.certifications.visible",
      "content.sections.awards.visible",
      "content.sections.interests.visible",
      "content.sections.additionalInfo.visible",
    ],
  });

  // Theo dõi mảng items của từng section để thêm/xóa/sắp xếp item cập nhật ngay
  const watchedSectionItems = useWatch({
    control,
    name: [
      "content.sections.experience.items",
      "content.sections.education.items",
      "content.sections.skills.items",
      "content.sections.projects.items",
      "content.sections.certifications.items",
      "content.sections.awards.items",
    ],
  });

  const {
    reorderAreaSections,
    reorderSections,
    toggleSectionVisibility,
    moveSectionToArea,
    moveSectionBetweenAreas,
  } = useCvMutations();
  const sectionEditors = useCvSectionEditors();

  const builderFieldRenderer: CvFieldRenderer = useMemo(() => {
    return ({
      name,
      placeholder,
      multiline,
      className: fieldClassName,
      isReadOnly: fieldReadOnly,
    }) => (
      <TiptapField
        name={name as FieldPath<RichTextCvEditorValues>}
        placeholder={placeholder}
        multiline={multiline}
        className={fieldClassName}
        isReadOnly={fieldReadOnly}
      />
    );
  }, []);

  const templateCode =
    (watchedTemplateCode as CvTemplateCode) ||
    (getValues("content.metadata.templateCode") as CvTemplateCode) ||
    "senior_harvard";
  const Template =
    TEMPLATE_REGISTRY[templateCode] ?? TEMPLATE_REGISTRY.senior_harvard;

  const currentLayout = useMemo(() => {
    if (watchedLayout && Array.isArray(watchedLayout.areas)) {
      return watchedLayout;
    }
    const raw = getValues("layout");
    if (watchedLayoutAreas) {
      return { ...raw, areas: watchedLayoutAreas };
    }
    return raw;
  }, [watchedLayout, watchedLayoutAreas, getValues]);
  const currentContent = useMemo(() => {
    const raw = getValues("content") as unknown as RichTextCVContentDocument;
    if (!raw || !raw.sections) return raw;

    const [
      objectiveVisible,
      experienceVisible,
      educationVisible,
      skillsVisible,
      projectsVisible,
      certificationsVisible,
      awardsVisible,
      interestsVisible,
      additionalInfoVisible,
    ] = watchedVisibility || [];

    const [
      experienceItems,
      educationItems,
      skillsItems,
      projectsItems,
      certificationsItems,
      awardsItems,
    ] = watchedSectionItems || [];

    return {
      ...raw,
      metadata: {
        ...raw.metadata,
        defaultStyle: watchedDefaultStyle ?? raw.metadata?.defaultStyle,
      },
      profile: {
        ...raw.profile,
        avatarUrl: watchedAvatarUrl ?? raw.profile?.avatarUrl,
      },
      sections: {
        ...raw.sections,
        objective: raw.sections.objective
          ? { ...raw.sections.objective, visible: objectiveVisible !== false }
          : raw.sections.objective,
        experience: raw.sections.experience
          ? {
              ...raw.sections.experience,
              visible: experienceVisible !== false,
              items:
                (experienceItems as RichTextCVContentDocument["sections"]["experience"]["items"]) ??
                raw.sections.experience.items,
            }
          : raw.sections.experience,
        education: raw.sections.education
          ? {
              ...raw.sections.education,
              visible: educationVisible !== false,
              items:
                (educationItems as RichTextCVContentDocument["sections"]["education"]["items"]) ??
                raw.sections.education.items,
            }
          : raw.sections.education,
        skills: raw.sections.skills
          ? {
              ...raw.sections.skills,
              visible: skillsVisible !== false,
              items:
                (skillsItems as RichTextCVContentDocument["sections"]["skills"]["items"]) ??
                raw.sections.skills.items,
            }
          : raw.sections.skills,
        projects: raw.sections.projects
          ? {
              ...raw.sections.projects,
              visible: projectsVisible !== false,
              items:
                (projectsItems as RichTextCVContentDocument["sections"]["projects"]["items"]) ??
                raw.sections.projects.items,
            }
          : raw.sections.projects,
        certifications: raw.sections.certifications
          ? {
              ...raw.sections.certifications,
              visible: certificationsVisible !== false,
              items:
                (certificationsItems as RichTextCVContentDocument["sections"]["certifications"]["items"]) ??
                raw.sections.certifications.items,
            }
          : raw.sections.certifications,
        awards: raw.sections.awards
          ? {
              ...raw.sections.awards,
              visible: awardsVisible !== false,
              items:
                (awardsItems as RichTextCVContentDocument["sections"]["awards"]["items"]) ??
                raw.sections.awards.items,
            }
          : raw.sections.awards,
        interests: raw.sections.interests
          ? { ...raw.sections.interests, visible: interestsVisible !== false }
          : raw.sections.interests,
        additionalInfo: raw.sections.additionalInfo
          ? { ...raw.sections.additionalInfo, visible: additionalInfoVisible !== false }
          : raw.sections.additionalInfo,
      },
    };
  }, [
    watchedVisibility,
    watchedSectionItems,
    watchedDefaultStyle,
    watchedAvatarUrl,
    getValues,
  ]);

  const layoutValidation = useMemo(() => {
    return validateCvLayout(currentLayout, templateCode);
  }, [currentLayout, templateCode]);

  const normalizedLayout = useMemo(() => {
    return ensureValidLayout(currentLayout, templateCode);
  }, [currentLayout, templateCode]);

  return (
    <main
      className={`flex flex-1 flex-col items-center overflow-x-auto bg-slate-100 px-4 py-8 min-h-full ${className}`}
    >
      <div
        className="cv-zoom-viewport flex justify-center min-w-fit shrink-0"
        style={{
          transform: zoom !== 1 ? `scale(${zoom})` : undefined,
          transformOrigin: "top center",
          marginBottom:
            zoom > 1
              ? `calc((297mm + 4rem) * ${zoom - 1} + 2rem)`
              : "2rem",
        }}
      >
        <div ref={contentRef} className="print-container">
        {!layoutValidation.isValid ? (
          <div className="mx-auto min-h-[200px] w-[210mm] rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/80 p-8 text-rose-900 shadow-md">
            <h3 className="text-lg font-bold text-rose-700">
              Lỗi cấu trúc Layout CV không hợp lệ
            </h3>
            <p className="mt-1 text-sm text-rose-600">
              Dữ liệu layout hiện tại không tương thích với template &ldquo;{templateCode}&rdquo;:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm font-medium text-rose-800">
              {layoutValidation.errors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        ) : (
          currentContent && (
            <Template
              content={currentContent}
              layout={normalizedLayout}
              renderField={builderFieldRenderer}
              isReadOnly={isReadOnly}
              sectionEditors={!isReadOnly ? sectionEditors : undefined}
              onReorderAreaSections={
                !isReadOnly ? reorderAreaSections : undefined
              }
              onMoveSectionToArea={!isReadOnly ? moveSectionToArea : undefined}
              onMoveSectionBetweenAreas={
                !isReadOnly ? moveSectionBetweenAreas : undefined
              }
              onReorderSections={!isReadOnly ? reorderSections : undefined}
              onToggleSectionVisibility={
                !isReadOnly ? toggleSectionVisibility : undefined
              }
            />
          )
        )}
        </div>
      </div>
      {/* Spacer đệm dưới cùng đảm bảo thanh cuộn luôn có khoảng trống tối thiểu 2rem dưới đáy CV */}
      <div className="no-print h-4 w-full shrink-0" aria-hidden="true" />
    </main>
  );
}
