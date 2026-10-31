import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import type { RichTextCVContentDocument } from "@/types/cv";
import type { FixedSectionKey } from "../../types";
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
import DraggableSectionActions from "../../builder/components/DraggableSectionActions";
import { CvTiptapReadOnlyView } from "../../builder/components/CvTiptapReadOnlyView";
import { getCvFontFamilyCss } from "../../constants/fonts";
import type { CvTemplateProps, CvFieldRenderer } from "../types";

const defaultReadOnlyRenderer: CvFieldRenderer = ({
  document,
  placeholder,
  className,
}) => (
  <CvTiptapReadOnlyView
    document={document}
    placeholder={placeholder}
    className={className}
  />
);

/**
 * ModernTwoColumnTemplate:
 * Component giao diện hiển thị CV chuẩn trang giấy A4.
 * Nhận dữ liệu tường minh qua props và không phụ thuộc ngầm vào form context.
 */
export const ModernTwoColumnTemplate: React.FC<CvTemplateProps> = ({
  className = "",
  data,
  renderField = defaultReadOnlyRenderer,
  isReadOnly = false,
  sectionEditors,
  onReorderSections,
  onToggleSectionVisibility,
}) => {
  if (!data) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-border bg-surface text-sm text-text-muted">
        Chưa có dữ liệu CV để hiển thị.
      </div>
    );
  }

  // Chuẩn hóa dữ liệu content từ CvRenderData
  const content: RichTextCVContentDocument =
    "content" in data && data.content && typeof data.content === "object"
      ? (data.content as RichTextCVContentDocument)
      : "defaultContent" in data &&
          data.defaultContent &&
          typeof data.defaultContent === "object"
        ? (data.defaultContent as RichTextCVContentDocument)
        : (data as RichTextCVContentDocument);

  if (!content || !content.profile || !content.sections) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-border bg-surface text-sm text-text-muted">
        Chưa có dữ liệu CV để hiển thị.
      </div>
    );
  }

  const { profile, sections, metadata } = content;
  const globalStyles = metadata?.defaultStyle;

  const primaryColor = globalStyles?.primaryColors?.[0] || "#0F172A";
  const fontFamily = globalStyles?.fontFamily || "inter";
  const lineHeight = globalStyles?.lineHeight || 1.5;
  const fontScale = globalStyles?.fontScale ?? 1.0;

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

  // Xử lý kéo thả sắp xếp lại thứ tự section
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || isReadOnly || !onReorderSections) return;
    const reordered = Array.from(sectionOrder);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    onReorderSections(reordered);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!onReorderSections) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sectionOrder.length) return;
    const reordered = Array.from(sectionOrder);
    const [removed] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, removed);
    onReorderSections(reordered);
  };

  const renderSectionContent = (key: string) => {
    switch (key) {
      case "objective":
        return (
          <ObjectiveSection
            section={sections.objective}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
          />
        );
      case "education":
        return (
          <EducationSection
            section={sections.education}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
            actions={sectionEditors?.education}
          />
        );
      case "experience":
        return (
          <ExperienceSection
            section={sections.experience}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
            actions={sectionEditors?.experience}
          />
        );
      case "skills":
        return (
          <SkillsSection
            section={sections.skills}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
            actions={sectionEditors?.skills}
          />
        );
      case "projects":
        return (
          <ProjectsSection
            section={sections.projects}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
            actions={sectionEditors?.projects}
          />
        );
      case "certifications":
        return (
          <CertificationsSection
            section={sections.certifications}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
            actions={sectionEditors?.certifications}
          />
        );
      case "awards":
        return (
          <AwardsSection
            section={sections.awards}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
            actions={sectionEditors?.awards}
          />
        );
      case "interests":
        return (
          <TextSection
            section={sections.interests}
            sectionKey="interests"
            defaultTitle="SỞ THÍCH"
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
          />
        );
      case "additionalInfo":
        return (
          <TextSection
            section={sections.additionalInfo}
            sectionKey="additionalInfo"
            defaultTitle="THÔNG TIN BỔ SUNG"
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
          />
        );
      default:
        return null;
    }
  };

  const canDrag = !isReadOnly && Boolean(onReorderSections);

  return (
    <div
      className={`cv-page-container mx-auto min-h-[297mm] w-[210mm] bg-white p-4 text-slate-900 shadow-xl print:m-0 print:p-4 print:shadow-none ${className}`}
      style={{
        fontFamily: getCvFontFamilyCss(fontFamily),
        lineHeight,
        ["--cv-font-scale" as string]: fontScale,
        ["--cv-line-height" as string]: lineHeight,
      }}
    >
      {/* 1. Header: Thông tin cá nhân Profile */}
      {profile && (
        <ProfileHeader
          profile={profile}
          primaryColor={primaryColor}
          isReadOnly={isReadOnly}
          renderField={renderField}
        />
      )}

      {/* 2. Danh sách các Sections (Kéo thả nếu trong Builder, hoặc render phẳng nếu chỉ đọc) */}
      {canDrag ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId="cv-template-sections"
            isDropDisabled={isReadOnly}
          >
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
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
                        className={`group relative rounded-sm px-2 py-1 transition-colors hover:ring-1 hover:ring-slate-300 ${
                          snapshot.isDragging
                            ? "z-50 !transition-none bg-white opacity-95 shadow-2xl ring-2 ring-primary/40"
                            : ""
                        }`}
                      >
                        <DraggableSectionActions
                          dragHandleProps={dragProvided.dragHandleProps}
                          isFirst={index === 0}
                          isLast={index === sectionOrder.length - 1}
                          onMoveUp={() => moveSection(index, "up")}
                          onMoveDown={() => moveSection(index, "down")}
                          onDelete={() =>
                            onToggleSectionVisibility?.(
                              sectionKey as FixedSectionKey,
                            )
                          }
                        />
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
      ) : (
        <div className="">
          {sectionOrder.map((sectionKey) => (
            <div key={sectionKey} className="relative rounded-sm px-2 py-1">
              {renderSectionContent(sectionKey)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModernTwoColumnTemplate;
