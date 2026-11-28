import React, { useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import type { FixedSectionKey } from "../../types";
import { ProfileHeader } from "./ProfileHeader";
import { ContactInfoBlock } from "./ContactInfoBlock";
import { ObjectiveSection } from "./ObjectiveSection";
import { EducationSection } from "./EducationSection";
import { ExperienceSection } from "./ExperienceSection";
import { SkillsSection } from "./SkillsSection";
import { ProjectsSection } from "./ProjectsSection";
import { CertificationsSection } from "./CertificationsSection";
import { AwardsSection } from "./AwardsSection";
import { InterestsSection } from "./InterestsSection";
import { AdditionalInfoSection } from "./AdditionalInfoSection";
import DraggableSectionActions from "../../builder/components/DraggableSectionActions";
import { CvTiptapReadOnlyView } from "../../builder/components/CvTiptapReadOnlyView";
import { DEFAULT_CV_FONT_ID, getCvFontFamilyCss } from "../../constants/fonts";
import type { CvTemplateProps, CvFieldRenderer } from "../types";
import { getCvTemplateMetadata } from "../templateMetadata";
import { useCvHighlightStore } from "@/stores/cvHighlightStore";

const THIS_TEMPLATE_CODE = "minimalist_cv";
const MAIN_AREA_ID = "main";
const SIDEBAR_AREA_ID = "sidebar";

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
 * MinimalistCvTemplate:
 * Template CV hai cột tối giản hiện đại (cột trái main ~ 60%, cột phải sidebar ~ 40%).
 * Hỗ trợ đầy đủ Dual Primary Color bridge, Avatar Crop 3:4, kéo thả DnD giữa 2 cột,
 * AI highlight tracking và phân trang in ấn A4 chuẩn mực.
 */
export const MinimalistCvTemplate: React.FC<CvTemplateProps> = React.memo(
  ({
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
    const highlightSectionKey = useCvHighlightStore(
      (s) => s.highlightSectionKey,
    );

    const { profile, sections, metadata } = content || {};
    const globalStyles = metadata?.defaultStyle;

    const primaryColor = globalStyles?.primaryColors?.[0] || "#1E293B";
    const secondaryColor = globalStyles?.primaryColors?.[1] || "#0F172A";
    const fontFamily = globalStyles?.fontFamily || DEFAULT_CV_FONT_ID;
    const lineHeight = globalStyles?.lineHeight || 1.5;
    const fontScale = globalStyles?.fontScale ?? 1.0;

    const cssVars = useMemo(
      () =>
        ({
          fontFamily: getCvFontFamilyCss(fontFamily),
          lineHeight,
          ["--cv-font-scale" as string]: fontScale,
          ["--cv-line-height" as string]: lineHeight,
          ["--cv-primary-1" as string]: `var(--cv-preview-primary-1, ${primaryColor})`,
          ["--cv-primary-2" as string]: `var(--cv-preview-primary-2, ${secondaryColor})`,
        }) as React.CSSProperties,
      [fontFamily, lineHeight, fontScale, primaryColor, secondaryColor],
    );

    const isSectionVisible = useCallback(
      (key: string): boolean => {
        const sec = sections?.[key as keyof typeof sections];
        if (!sec || typeof sec !== "object") return true;
        return (sec as { visible?: boolean }).visible !== false;
      },
      [sections],
    );

    const mainArea = useMemo(
      () => layout?.areas?.find((area) => area.id === MAIN_AREA_ID),
      [layout?.areas],
    );

    const sidebarArea = useMemo(
      () => layout?.areas?.find((area) => area.id === SIDEBAR_AREA_ID),
      [layout?.areas],
    );

    const supportedAreaIds = useMemo(
      () => getCvTemplateMetadata(THIS_TEMPLATE_CODE).supportedAreaIds,
      [],
    );

    const unknownAreas = useMemo(
      () =>
        (layout?.areas || []).filter(
          (area) => !supportedAreaIds.includes(area.id),
        ),
      [layout?.areas, supportedAreaIds],
    );

    const isRenderableInArea = useCallback(
      (areaId: string, key: string): boolean =>
        isSectionVisible(key) && !(areaId === MAIN_AREA_ID && key === "objective"),
      [isSectionVisible],
    );

    const visibleMainSections = useMemo(
      () =>
        (mainArea?.sections || []).filter((k) =>
          isRenderableInArea(MAIN_AREA_ID, k),
        ),
      [mainArea?.sections, isRenderableInArea],
    );

    const visibleSidebarSections = useMemo(
      () => (sidebarArea?.sections || []).filter(isSectionVisible),
      [sidebarArea?.sections, isSectionVisible],
    );

    const handleDragEnd = useCallback(
      (result: DropResult) => {
        if (!result.destination || isReadOnly) return;
        const sourceAreaId = result.source.droppableId;
        const destAreaId = result.destination.droppableId;
        const sourceIndex = result.source.index;
        const destIndex = result.destination.index;

        if (sourceAreaId === destAreaId) {
          if (sourceIndex === destIndex) return;
          const targetArea = layout?.areas?.find((a) => a.id === sourceAreaId);
          if (!targetArea) return;

          const currentVisible = targetArea.sections.filter((k) =>
            isRenderableInArea(sourceAreaId, k),
          );
          const [moved] = currentVisible.splice(sourceIndex, 1);
          if (!moved) return;
          currentVisible.splice(destIndex, 0, moved);

          const remainingSections = targetArea.sections.filter(
            (k) => !isRenderableInArea(sourceAreaId, k),
          );
          onReorderAreaSections?.(sourceAreaId, [
            ...remainingSections,
            ...currentVisible,
          ]);
          return;
        }

        const sourceArea = layout?.areas?.find((a) => a.id === sourceAreaId);
        const destArea = layout?.areas?.find((a) => a.id === destAreaId);
        if (!sourceArea || !destArea) return;

        onMoveSectionBetweenAreas?.(
          sourceAreaId,
          destAreaId,
          sourceIndex,
          destIndex,
        );
      },
      [
        isReadOnly,
        layout?.areas,
        isRenderableInArea,
        onReorderAreaSections,
        onMoveSectionBetweenAreas,
      ],
    );

    const moveSection = useCallback(
      (areaId: string, visibleIndex: number, direction: "up" | "down") => {
        const targetArea = layout?.areas?.find((a) => a.id === areaId);
        if (!targetArea) return;

        const visible = targetArea.sections.filter((k) =>
          isRenderableInArea(areaId, k),
        );
        const targetIndex =
          direction === "up" ? visibleIndex - 1 : visibleIndex + 1;
        if (targetIndex < 0 || targetIndex >= visible.length) return;

        const [moved] = visible.splice(visibleIndex, 1);
        visible.splice(targetIndex, 0, moved);

        const remainingSections = targetArea.sections.filter(
          (k) => !isRenderableInArea(areaId, k),
        );
        onReorderAreaSections?.(areaId, [...remainingSections, ...visible]);
      },
      [layout?.areas, isRenderableInArea, onReorderAreaSections],
    );

    const renderSectionContent = useCallback(
      (sectionKey: string) => {
        if (!sections) return null;
        switch (sectionKey) {
          case "objective":
            return sections.objective ? (
              <ObjectiveSection
                section={sections.objective}
                isReadOnly={isReadOnly}
                renderField={renderField}
              />
            ) : null;
          case "education":
            return sections.education ? (
              <EducationSection
                section={sections.education}
                isReadOnly={isReadOnly}
                renderField={renderField}
                actions={sectionEditors?.education}
              />
            ) : null;
          case "experience":
            return sections.experience ? (
              <ExperienceSection
                section={sections.experience}
                isReadOnly={isReadOnly}
                renderField={renderField}
                actions={sectionEditors?.experience}
              />
            ) : null;
          case "projects":
            return sections.projects ? (
              <ProjectsSection
                section={sections.projects}
                isReadOnly={isReadOnly}
                renderField={renderField}
                actions={sectionEditors?.projects}
              />
            ) : null;
          case "awards":
            return sections.awards ? (
              <AwardsSection
                section={sections.awards}
                isReadOnly={isReadOnly}
                renderField={renderField}
                actions={sectionEditors?.awards}
              />
            ) : null;
          case "skills":
            return sections.skills ? (
              <SkillsSection
                section={sections.skills}
                isReadOnly={isReadOnly}
                renderField={renderField}
                actions={sectionEditors?.skills}
              />
            ) : null;
          case "certifications":
            return sections.certifications ? (
              <CertificationsSection
                section={sections.certifications}
                isReadOnly={isReadOnly}
                renderField={renderField}
                actions={sectionEditors?.certifications}
              />
            ) : null;
          case "additionalInfo":
            return sections.additionalInfo ? (
              <AdditionalInfoSection
                section={sections.additionalInfo}
                isReadOnly={isReadOnly}
                renderField={renderField}
              />
            ) : null;
          case "interests":
            return sections.interests ? (
              <InterestsSection
                section={sections.interests}
                isReadOnly={isReadOnly}
                renderField={renderField}
              />
            ) : null;
          default:
            return null;
        }
      },
      [sections, isReadOnly, renderField, sectionEditors],
    );

    const canDrag = !isReadOnly && Boolean(onReorderAreaSections);

    const renderDraggableList = useCallback(
      (areaId: string, visibleList: string[]) => (
        <Droppable droppableId={areaId} isDropDisabled={!canDrag}>
          {(dropProvided) => (
            <div
              ref={dropProvided.innerRef}
              {...dropProvided.droppableProps}
              className="min-h-[40px] space-y-5"
            >
              {visibleList.map((sectionKey, index) => {
                const sectionNode = renderSectionContent(sectionKey);
                if (!sectionNode) return null;
                const isHighlighted = highlightSectionKey === sectionKey;

                return (
                  <Draggable
                    key={sectionKey}
                    draggableId={sectionKey}
                    index={index}
                    isDragDisabled={!canDrag}
                  >
                    {(dragProvided, snapshot) => {
                      const draggableElement = (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          style={{
                            ...dragProvided.draggableProps.style,
                            ...(snapshot.isDragging ? cssVars : undefined),
                          }}
                          className={`group relative rounded-sm transition-all duration-300 ${
                            !isReadOnly
                              ? "hover:ring-1 hover:ring-slate-200/80"
                              : ""
                          } ${
                            snapshot.isDragging
                              ? "z-50 bg-white/95 p-2 shadow-lg ring-1 ring-slate-200"
                              : ""
                          } ${
                            isHighlighted
                              ? "animate-pulse bg-blue-50/40 ring-2 ring-blue-500 ring-offset-4"
                              : ""
                          }`}
                        >
                          {!isReadOnly && (
                            <DraggableSectionActions
                              dragHandleProps={dragProvided.dragHandleProps}
                              isFirst={index === 0}
                              isLast={index === visibleList.length - 1}
                              sectionKey={sectionKey}
                              onMoveUp={() => moveSection(areaId, index, "up")}
                              onMoveDown={() =>
                                moveSection(areaId, index, "down")
                              }
                              onDelete={() =>
                                onToggleSectionVisibility?.(
                                  sectionKey as FixedSectionKey,
                                )
                              }
                            />
                          )}
                          {sectionNode}
                        </div>
                      );

                      return snapshot.isDragging
                        ? createPortal(draggableElement, document.body)
                        : draggableElement;
                    }}
                  </Draggable>
                );
              })}
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>
      ),
      [
        canDrag,
        renderSectionContent,
        highlightSectionKey,
        cssVars,
        isReadOnly,
        moveSection,
        onToggleSectionVisibility,
      ],
    );

    if (!content || !layout || !sections || !profile) {
      return null;
    }

    return (
      <div
        className={`cv-page-container mx-auto min-h-[1123px] w-full max-w-[794px] bg-white p-10 text-slate-900 ${className}`}
        style={cssVars}
      >
        <ProfileHeader
          profile={profile}
          objectiveSection={sections.objective}
          isObjectiveHighlighted={highlightSectionKey === "objective"}
          isReadOnly={isReadOnly}
          renderField={renderField}
        />

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Cột trái (~58% / 7 cột): Khối Học vấn nền sẫm + Kinh nghiệm + Dự án + Giải thưởng */}
            <div className="md:col-span-7">
              {renderDraggableList(MAIN_AREA_ID, visibleMainSections)}
            </div>

            {/* Cột phải (~42% / 5 cột): Thông tin cá nhân + Kỹ năng + Chứng chỉ + Người giới thiệu + Sở thích */}
            <div className="md:col-span-5">
              <ContactInfoBlock
                profile={profile}
                isReadOnly={isReadOnly}
                renderField={renderField}
              />
              {renderDraggableList(SIDEBAR_AREA_ID, visibleSidebarSections)}
            </div>
          </div>

          {unknownAreas.map((area) => {
            const visibleUnknown = area.sections.filter(isSectionVisible);
            if (visibleUnknown.length === 0) return null;
            return (
              <div key={area.id} className="mt-6">
                {renderDraggableList(area.id, visibleUnknown)}
              </div>
            );
          })}
        </DragDropContext>
      </div>
    );
  },
);

MinimalistCvTemplate.displayName = "MinimalistCvTemplate";
export default MinimalistCvTemplate;
