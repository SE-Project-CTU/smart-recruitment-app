import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import type { FixedSectionKey } from "../../types";
import { SidebarProfile } from "./SidebarProfile";
import { EducationSection } from "./EducationSection";
import { SkillsSection } from "./SkillsSection";
import { ExperienceSection } from "./ExperienceSection";
import { ProjectsSection } from "./ProjectsSection";
import { ObjectiveSection } from "./ObjectiveSection";
import { CertificationsSection } from "./CertificationsSection";
import { AwardsSection } from "./AwardsSection";
import { AdditionalInfoSection } from "./AdditionalInfoSection";
import { InterestsSection } from "./InterestsSection";
import DraggableSectionActions from "../../builder/components/DraggableSectionActions";
import { CvTiptapReadOnlyView } from "../../builder/components/CvTiptapReadOnlyView";
import { DEFAULT_CV_FONT_ID, getCvFontFamilyCss } from "../../constants/fonts";
import type { CvTemplateProps, CvFieldRenderer } from "../types";
import { getCvTemplateMetadata } from "../templateMetadata";

const THIS_TEMPLATE_CODE = "sidebar_classic";
const SIDEBAR_AREA_ID = "sidebar";
const MAIN_AREA_ID = "main";

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
 * SidebarClassicTemplate:
 * Template CV hai cột phong cách TopCV / Sidebar Classic.
 * Cột sidebar: Nền xám (#E8E8E8), chữ đen, tiêu đề khối chữ nhật đen chữ trắng.
 * Cột main: Nền trắng, tiêu đề khối chữ nhật đen chữ trắng.
 */
export const SidebarClassicTemplate: React.FC<CvTemplateProps> = ({
  className = "",
  content,
  layout,
  renderField = defaultReadOnlyRenderer,
  isReadOnly = false,
  sectionEditors,
  onReorderAreaSections,
  onMoveSectionBetweenAreas,
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

  // Màu tiêu đề chủ đạo: mặc định là đen/xám than (#262626) như trong ảnh mẫu
  const primaryColor = globalStyles?.primaryColors?.[0] || "#262626";
  const fontFamily = globalStyles?.fontFamily || DEFAULT_CV_FONT_ID;
  const lineHeight = globalStyles?.lineHeight || 1.5;
  const fontScale = globalStyles?.fontScale ?? 1.0;

  const sidebarArea = layout.areas.find((area) => area.id === SIDEBAR_AREA_ID);
  const mainArea = layout.areas.find((area) => area.id === MAIN_AREA_ID);

  if (!sidebarArea || !mainArea) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/70 p-8 text-center text-rose-800">
        <p className="text-lg font-bold">Lỗi cấu trúc Layout</p>
        <p className="mt-1 text-sm text-rose-600">
          Template Sidebar Classic yêu cầu cả 2 vùng &quot;sidebar&quot; và &quot;main&quot;, nhưng layout hiện tại không đủ.
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
        <p className="text-lg font-bold">Lỗi Area không hợp lệ</p>
        <p className="mt-1 text-sm text-rose-600">
          Template Sidebar Classic không hỗ trợ area: {unknownAreas.map((a) => a.id).join(", ")}.
        </p>
      </div>
    );
  }

  const isSectionVisible = (key: string): boolean => {
    const sec = sections[key as keyof typeof sections];
    if (!sec || typeof sec !== "object") return true;
    return (sec as { visible?: boolean }).visible !== false;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || isReadOnly) return;
    const sourceAreaId = result.source.droppableId;
    const destAreaId = result.destination.droppableId;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceAreaId === destAreaId) {
      if (sourceIndex === destIndex) return;
      const targetArea = layout.areas.find((a) => a.id === sourceAreaId);
      if (!targetArea) return;
      const reordered = Array.from(targetArea.sections);
      const [removed] = reordered.splice(sourceIndex, 1);
      if (removed) {
        reordered.splice(destIndex, 0, removed);
        onReorderAreaSections?.(sourceAreaId, reordered);
      }
    } else {
      onMoveSectionBetweenAreas?.(
        sourceAreaId,
        destAreaId,
        sourceIndex,
        destIndex,
      );
    }
  };

  const moveSectionInArea = (
    areaId: string,
    index: number,
    direction: "up" | "down",
  ) => {
    const targetArea = layout.areas.find((a) => a.id === areaId);
    if (!targetArea) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= targetArea.sections.length) return;
    const reordered = Array.from(targetArea.sections);
    const [removed] = reordered.splice(index, 1);
    if (removed) {
      reordered.splice(newIndex, 0, removed);
      onReorderAreaSections?.(areaId, reordered);
    }
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
          <InterestsSection
            section={sections.interests}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
          />
        );
      case "additionalInfo":
        return (
          <AdditionalInfoSection
            section={sections.additionalInfo}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
          />
        );
      default:
        return null;
    }
  };

  const canDrag =
    !isReadOnly &&
    Boolean(onReorderAreaSections || onMoveSectionBetweenAreas);

  const renderAreaSections = (areaId: string, sectionsList: string[]) => {
    if (canDrag) {
      return (
        <Droppable droppableId={areaId} isDropDisabled={isReadOnly}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="min-h-[120px]"
            >
              {sectionsList.map((sectionKey, index) => {
                const visible = isSectionVisible(sectionKey);
                return (
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
                        className={`group relative rounded-sm transition-colors hover:ring-1 hover:ring-slate-400 ${
                          !visible ? "opacity-40 grayscale" : ""
                        } ${
                          snapshot.isDragging
                            ? "z-50 !transition-none bg-white opacity-95 shadow-2xl ring-2 ring-primary/40"
                            : ""
                        }`}
                      >
                        <DraggableSectionActions
                          dragHandleProps={dragProvided.dragHandleProps}
                          isFirst={index === 0}
                          isLast={index === sectionsList.length - 1}
                          onMoveUp={() =>
                            moveSectionInArea(areaId, index, "up")
                          }
                          onMoveDown={() =>
                            moveSectionInArea(areaId, index, "down")
                          }
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
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    }

    return (
      <div>
        {sectionsList
          .filter((sectionKey) => isSectionVisible(sectionKey))
          .map((sectionKey) => (
            <div key={sectionKey} className="relative rounded-sm">
              {renderSectionContent(sectionKey)}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div
      className={`cv-page-container mx-auto min-h-[297mm] w-[210mm] bg-white text-slate-900 shadow-xl print:m-0 print:shadow-none flex overflow-hidden ${className}`}
      style={{
        fontFamily: getCvFontFamilyCss(fontFamily),
        lineHeight,
        ["--cv-font-scale" as string]: fontScale,
        ["--cv-line-height" as string]: lineHeight,
      }}
    >
      {canDrag ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Cột Sidebar bên trái: Chiều rộng 39%, nền xám (#E5E7EB hoặc #E9ECEF) */}
          <aside className="w-[39%] bg-[#EBECEE] px-6 py-8 shrink-0 flex flex-col">
            <SidebarProfile
              profile={profile}
              primaryColor={primaryColor}
              isReadOnly={isReadOnly}
              renderField={renderField}
            />
            <div className="mt-2 flex-1">
              {renderAreaSections(SIDEBAR_AREA_ID, sidebarArea.sections as string[])}
            </div>
          </aside>

          {/* Cột Main bên phải: Chiều rộng 61%, nền trắng */}
          <main className="w-[61%] px-7 py-8 flex-1 flex flex-col bg-white">
            {renderAreaSections(MAIN_AREA_ID, mainArea.sections as string[])}
          </main>
        </DragDropContext>
      ) : (
        <>
          <aside className="w-[39%] bg-[#EBECEE] px-6 py-8 shrink-0 flex flex-col">
            <SidebarProfile
              profile={profile}
              primaryColor={primaryColor}
              isReadOnly={isReadOnly}
              renderField={renderField}
            />
            <div className="mt-2 flex-1">
              {renderAreaSections(SIDEBAR_AREA_ID, sidebarArea.sections as string[])}
            </div>
          </aside>

          <main className="w-[61%] px-7 py-8 flex-1 flex flex-col bg-white">
            {renderAreaSections(MAIN_AREA_ID, mainArea.sections as string[])}
          </main>
        </>
      )}
    </div>
  );
};

export default SidebarClassicTemplate;
