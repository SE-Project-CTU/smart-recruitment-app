import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import type { CvEditorValues } from "@/features/cv-builder/schema/cvSchema";
import { ProfileHeader } from "./ProfileHeader";
import { ObjectiveSection } from "./ObjectiveSection";
import { EducationSection } from "./EducationSection";
import { ExperienceSection } from "./ExperienceSection";
import { SkillsSection } from "./SkillsSection";
import { ProjectsSection } from "./ProjectsSection";
import {
  CertificationsSection,
  AwardsSection,
  TextSection,
} from "./OtherSections";
import DraggableSectionActions from "../../components/draggable-section-actions";
import { useCvMutations } from "@/features/cv-builder/hooks/useCvMutations";
import type { FixedSectionKey } from "@/features/cv-builder/types";

interface ModernTwoColumnTemplateProps {
  className?: string;
  data?: CvEditorValues;
  isReadOnly?: boolean;
}

/**
 * ModernTwoColumnTemplate:
 * Render CV chuẩn WYSIWYG trên trang giấy A4.
 * Cho phép nhấp trực tiếp vào text để sửa qua contentEditable,
 * đồng thời hỗ trợ Kéo thả (Drag & Drop) để sắp xếp lại vị trí các Section.
 */
export const ModernTwoColumnTemplate: React.FC<
  ModernTwoColumnTemplateProps
> = ({ className = "", data: externalData, isReadOnly = false }) => {
  const formContext = useFormContext<CvEditorValues>();

  const watchedData = useWatch({
    control: formContext?.control,
  }) as CvEditorValues | undefined;

  const { reorderSections, toggleSectionVisibility } = useCvMutations();

  const data = externalData || watchedData;

  if (!data || !data.content) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-border bg-surface text-sm text-text-muted">
        Chưa có dữ liệu CV để hiển thị.
      </div>
    );
  }

  const { content, presentation } = data;
  const { profile, sections } = content;
  const fields = presentation?.styles?.fields;
  const globalStyles = presentation?.styles?.global;

  const primaryColor = globalStyles?.primaryColor?.[0] || "#0F172A";
  const fontFamily = globalStyles?.fontFamily || "inter";
  const lineHeight = globalStyles?.lineHeight || 1.5;

  const sectionOrder = (sections.order || [
    "objective",
    "education",
    "experience",
    "skills",
    "projects",
    "certifications",
    "awards",
    "interests",
    "additionalInfo",
  ]) as string[];

  // Xử lý kéo thả reorder section
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || isReadOnly) return;
    const reordered = Array.from(sectionOrder);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    reorderSections(reordered);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sectionOrder.length) return;
    const reordered = Array.from(sectionOrder);
    const [removed] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, removed);
    reorderSections(reordered);
  };

  const renderSectionContent = (key: string) => {
    switch (key) {
      case "objective":
        return (
          <ObjectiveSection
            section={sections.objective}
            fields={fields}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
          />
        );
      case "education":
        return (
          <EducationSection
            section={sections.education}
            fields={fields}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
          />
        );
      case "experience":
        return (
          <ExperienceSection
            section={sections.experience}
            fields={fields}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
          />
        );
      case "skills":
        return (
          <SkillsSection
            section={sections.skills}
            fields={fields}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
          />
        );
      case "projects":
        return (
          <ProjectsSection
            section={sections.projects}
            fields={fields}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
          />
        );
      case "certifications":
        return (
          <CertificationsSection
            section={sections.certifications}
            fields={fields}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
          />
        );
      case "awards":
        return (
          <AwardsSection
            section={sections.awards}
            fields={fields}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
          />
        );
      case "interests":
        return (
          <TextSection
            section={sections.interests}
            sectionKey="interests"
            defaultTitle="SỞ THÍCH"
            fields={fields}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
          />
        );
      case "additionalInfo":
        return (
          <TextSection
            section={sections.additionalInfo}
            sectionKey="additionalInfo"
            defaultTitle="THÔNG TIN BỔ SUNG"
            fields={fields}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`mx-auto min-h-[297mm] w-[210mm] bg-white p-4 text-slate-900 shadow-xl print:m-0 print:p-4 print:shadow-none ${className}`}
      style={{
        fontFamily:
          fontFamily.includes("sans") || fontFamily.includes("serif")
            ? fontFamily
            : `'${fontFamily}', sans-serif`,
        lineHeight,
      }}
    >
      {/* 1. Header: Profile Info WYSIWYG */}
      {profile && (
        <ProfileHeader
          profile={profile}
          fields={fields}
          primaryColor={primaryColor}
          isReadOnly={isReadOnly}
        />
      )}

      {/* 2. DragDropContext cho các Section trực tiếp trên CV */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="cv-template-sections"
          isDropDisabled={isReadOnly}
        >
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="mt-3 space-y-1"
            >
              {sectionOrder.map((sectionKey, index) => (
                <Draggable
                  key={sectionKey}
                  draggableId={sectionKey}
                  index={index}
                  isDragDisabled={isReadOnly}
                >
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={`group relative rounded-sm px-2 py-1 transition-all ${
                        !isReadOnly ? "hover:ring-1 hover:ring-slate-300" : ""
                      } ${
                        snapshot.isDragging
                          ? "z-50 bg-white opacity-95 shadow-2xl ring-1"
                          : ""
                      }`}
                    >
                      {/* Floating toolbar for draggable sections */}
                      {!isReadOnly && (
                        <DraggableSectionActions
                          dragHandleProps={dragProvided.dragHandleProps}
                          isFirst={index === 0}
                          isLast={index === sectionOrder.length - 1}
                          onMoveUp={() => moveSection(index, "up")}
                          onMoveDown={() => moveSection(index, "down")}
                          onDelete={() =>
                            toggleSectionVisibility(
                              sectionKey as FixedSectionKey,
                            )
                          }
                        />
                      )}

                      {renderSectionContent(sectionKey)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
