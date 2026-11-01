import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
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
import { DEFAULT_CV_FONT_ID, getCvFontFamilyCss } from "../../constants/fonts";
import type { CvTemplateProps, CvFieldRenderer } from "../types";
import { getCvTemplateMetadata } from "../templateMetadata";

const THIS_TEMPLATE_CODE = "senior_harvard";
const THIS_MAIN_AREA_ID = "main";

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
 * SeniorHarvardTemplate:
 * Template CV chuẩn phong cách Harvard, bố cục 1 cột truyền thống.
 * Toàn bộ sections được phân bổ và sắp xếp theo duy nhất 1 area: "main".
 */
export const SeniorHarvardTemplate: React.FC<CvTemplateProps> = ({
  className = "",
  content,
  layout,
  renderField = defaultReadOnlyRenderer,
  isReadOnly = false,
  sectionEditors,
  onReorderAreaSections,
  onReorderSections,
  onToggleSectionVisibility,
}) => {
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
  const fontFamily = globalStyles?.fontFamily || DEFAULT_CV_FONT_ID;
  const lineHeight = globalStyles?.lineHeight || 1.5;
  const fontScale = globalStyles?.fontScale ?? 1.0;

  const isSectionVisible = (key: string): boolean => {
    const sec = sections[key as keyof typeof sections];
    if (!sec || typeof sec !== "object") return true;
    return (sec as { visible?: boolean }).visible !== false;
  };

  const mainArea = layout.areas.find((area) => area.id === THIS_MAIN_AREA_ID);

  // Kiểm tra tính hợp lệ của area trong layout (Template chỉ hỗ trợ duy nhất area 'main')
  if (!mainArea) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/70 p-8 text-center text-rose-800">
        <p className="text-lg font-bold">Lỗi cấu trúc Layout</p>
        <p className="mt-1 text-sm text-rose-600">
          Template Senior Harvard yêu cầu vùng nội dung chính (&quot;main&quot;), nhưng layout dữ liệu không có.
        </p>
      </div>
    );
  }

  const supportedAreaIds =
    getCvTemplateMetadata(THIS_TEMPLATE_CODE).supportedAreaIds;
  const unknownAreas = layout.areas.filter(
    (area) => !supportedAreaIds.includes(area.id),
  );

  if (unknownAreas.length > 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/70 p-8 text-center text-rose-800">
        <p className="text-lg font-bold">Lỗi cấu trúc Layout</p>
        <p className="mt-1 text-sm text-rose-600">
          Phát hiện vùng layout không hợp lệ:{" "}
          {unknownAreas.map((a) => `'${a.id}'`).join(", ")}. Template Senior Harvard chỉ hỗ trợ duy nhất vùng: [&quot;main&quot;].
        </p>
      </div>
    );
  }

  // Kéo thả sắp xếp section trong area 'main'
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || isReadOnly) return;
    const { source, destination } = result;

    if (source.index === destination.index) return;

    const visibleSections = mainArea.sections.filter(isSectionVisible);
    const [moved] = visibleSections.splice(source.index, 1);
    if (!moved) return;
    visibleSections.splice(destination.index, 0, moved);

    const hiddenSections = mainArea.sections.filter((k) => !isSectionVisible(k));
    const newSections = [...visibleSections, ...hiddenSections];

    if (onReorderAreaSections) {
      onReorderAreaSections(THIS_MAIN_AREA_ID, newSections);
    } else if (onReorderSections) {
      onReorderSections(newSections);
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const visibleSections = mainArea.sections.filter(isSectionVisible);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= visibleSections.length) return;

    const [removed] = visibleSections.splice(index, 1);
    visibleSections.splice(newIndex, 0, removed);

    const hiddenSections = mainArea.sections.filter((k) => !isSectionVisible(k));
    const newSections = [...visibleSections, ...hiddenSections];

    if (onReorderAreaSections) {
      onReorderAreaSections("main", newSections);
    } else if (onReorderSections) {
      onReorderSections(newSections);
    }
  };

  const renderSectionContent = (key: FixedSectionKey | string) => {
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

  const canDrag = !isReadOnly && Boolean(onReorderAreaSections || onReorderSections);
  const visibleSections = mainArea.sections.filter(isSectionVisible);

  return (
    <div
      className={`cv-page-container mx-auto min-h-[297mm] w-[210mm] bg-white p-8 text-slate-900 shadow-xl print:m-0 print:p-8 print:shadow-none ${className}`}
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

      {/* 2. Danh sách các Sections 1 cột theo Layout area 'main' */}
      {canDrag ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={THIS_MAIN_AREA_ID} isDropDisabled={isReadOnly}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="min-h-16 space-y-2"
              >
                {visibleSections.map((sectionKey, index) => (
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
                          isLast={index === visibleSections.length - 1}
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
        <div className="space-y-2">
          {visibleSections.map((sectionKey) => (
            <div key={sectionKey} className="relative rounded-sm px-2 py-1">
              {renderSectionContent(sectionKey)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeniorHarvardTemplate;
