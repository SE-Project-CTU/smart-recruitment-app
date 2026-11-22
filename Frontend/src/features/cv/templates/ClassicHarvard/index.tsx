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

const THIS_TEMPLATE_CODE = "classic_harvard";
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
 * ClassicHarvardTemplate:
 * Template CV 1 cột phong cách Harvard kinh điển với banner section trang nhã,
 * căn chỉnh mốc thời gian rõ ràng và tối ưu ATS.
 */
export const ClassicHarvardTemplate: React.FC<CvTemplateProps> = React.memo(
  ({
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
    const highlightSectionKey = useCvHighlightStore(
      (s) => s.highlightSectionKey,
    );

    const { profile, sections, metadata } = content || {};
    const globalStyles = metadata?.defaultStyle;

    const primaryColor = globalStyles?.primaryColors?.[0] || "#0F172A";
    const bannerBgColor = globalStyles?.primaryColors?.[1] || "#F1F5F9";
    const fontFamily = globalStyles?.fontFamily || DEFAULT_CV_FONT_ID;
    const lineHeight = globalStyles?.lineHeight || 1.5;
    const fontScale = globalStyles?.fontScale ?? 1.0;

    const isSectionVisible = useCallback(
      (key: string): boolean => {
        const sec = sections?.[key as keyof typeof sections];
        if (!sec || typeof sec !== "object") return true;
        return (sec as { visible?: boolean }).visible !== false;
      },
      [sections],
    );

    const mainArea = useMemo(
      () => layout?.areas?.find((area) => area.id === THIS_MAIN_AREA_ID),
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

    const visibleSections = useMemo(
      () => (mainArea?.sections || []).filter(isSectionVisible),
      [mainArea?.sections, isSectionVisible],
    );

    const handleDragEnd = useCallback(
      (result: DropResult) => {
        if (!result.destination || isReadOnly || !mainArea) return;
        const { source, destination } = result;

        if (source.index === destination.index) return;

        const currentVisible = mainArea.sections.filter(isSectionVisible);
        const [moved] = currentVisible.splice(source.index, 1);
        if (!moved) return;
        currentVisible.splice(destination.index, 0, moved);

        const hiddenSections = mainArea.sections.filter(
          (k) => !isSectionVisible(k),
        );
        const newSections = [...currentVisible, ...hiddenSections];

        if (onReorderAreaSections) {
          onReorderAreaSections(THIS_MAIN_AREA_ID, newSections);
        } else if (onReorderSections) {
          onReorderSections(newSections);
        }
      },
      [
        isReadOnly,
        mainArea,
        isSectionVisible,
        onReorderAreaSections,
        onReorderSections,
      ],
    );

    const moveSection = useCallback(
      (index: number, direction: "up" | "down") => {
        if (!mainArea) return;
        const currentVisible = mainArea.sections.filter(isSectionVisible);
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= currentVisible.length) return;

        const [removed] = currentVisible.splice(index, 1);
        currentVisible.splice(newIndex, 0, removed);

        const hiddenSections = mainArea.sections.filter(
          (k) => !isSectionVisible(k),
        );
        const newSections = [...currentVisible, ...hiddenSections];

        if (onReorderAreaSections) {
          onReorderAreaSections(THIS_MAIN_AREA_ID, newSections);
        } else if (onReorderSections) {
          onReorderSections(newSections);
        }
      },
      [mainArea, isSectionVisible, onReorderAreaSections, onReorderSections],
    );

    const renderSectionContent = useCallback(
      (key: FixedSectionKey | string) => {
        if (!sections) return null;
        switch (key) {
          case "objective":
            return (
              <ObjectiveSection
                section={sections.objective}
                primaryColor={primaryColor}
                bannerBgColor={bannerBgColor}
                isReadOnly={isReadOnly}
                renderField={renderField}
              />
            );
          case "education":
            return (
              <EducationSection
                section={sections.education}
                primaryColor={primaryColor}
                bannerBgColor={bannerBgColor}
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
                bannerBgColor={bannerBgColor}
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
                bannerBgColor={bannerBgColor}
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
                bannerBgColor={bannerBgColor}
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
                bannerBgColor={bannerBgColor}
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
                bannerBgColor={bannerBgColor}
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
                bannerBgColor={bannerBgColor}
                isReadOnly={isReadOnly}
                renderField={renderField}
              />
            );
          case "additionalInfo":
            return (
              <AdditionalInfoSection
                section={sections.additionalInfo}
                primaryColor={primaryColor}
                bannerBgColor={bannerBgColor}
                isReadOnly={isReadOnly}
                renderField={renderField}
              />
            );
          default:
            return null;
        }
      },
      [
        sections,
        primaryColor,
        bannerBgColor,
        isReadOnly,
        renderField,
        sectionEditors,
      ],
    );

    // Early returns SAU khi tất cả Hooks đã được gọi:
    if (!content || !content.profile || !content.sections) {
      return (
        <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-border bg-surface text-sm text-text-muted">
          Chưa có dữ liệu CV để hiển thị.
        </div>
      );
    }

    if (!mainArea) {
      return (
        <div className="flex min-h-75 flex-col items-center justify-center rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/70 p-8 text-center text-rose-800">
          <p className="text-lg font-bold">Lỗi cấu trúc Layout</p>
          <p className="mt-1 text-sm text-rose-600">
            Template Classic Harvard yêu cầu vùng nội dung chính
            (&quot;main&quot;), nhưng layout dữ liệu không có.
          </p>
        </div>
      );
    }

    if (unknownAreas.length > 0) {
      return (
        <div className="flex min-h-75 flex-col items-center justify-center rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/70 p-8 text-center text-rose-800">
          <p className="text-lg font-bold">Lỗi cấu trúc Layout</p>
          <p className="mt-1 text-sm text-rose-600">
            Phát hiện vùng layout không hợp lệ:{" "}
            {unknownAreas.map((a) => `'${a.id}'`).join(", ")}. Template chỉ hỗ
            trợ duy nhất vùng: [&quot;main&quot;].
          </p>
        </div>
      );
    }

    const canDrag =
      !isReadOnly && Boolean(onReorderAreaSections || onReorderSections);

    return (
      <div
        className={`cv-page-container mx-auto w-[210mm] bg-white p-8 text-slate-900 shadow-xl print:m-0 print:px-8 print:py-0 print:shadow-none ${className}`}
        style={{
          fontFamily: getCvFontFamilyCss(fontFamily),
          lineHeight,
          ["--cv-font-scale" as string]: fontScale,
          ["--cv-line-height" as string]: lineHeight,
          ["--cv-primary-1" as string]: `var(--cv-preview-primary-1, ${primaryColor})`,
          ["--cv-primary-2" as string]: `var(--cv-preview-primary-2, ${bannerBgColor})`,
        }}
      >
        {/* 1. Header: Avatar & Thông tin cá nhân Profile */}
        {profile && (
          <ProfileHeader
            profile={profile}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
          />
        )}

        {/* 2. Danh sách các Sections 1 cột */}
        {canDrag ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable
              droppableId={THIS_MAIN_AREA_ID}
              isDropDisabled={isReadOnly}
            >
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
                      {(dragProvided, snapshot) => {
                        const isActiveSuggestion = Boolean(
                          !isReadOnly &&
                          highlightSectionKey &&
                          sectionKey.toLowerCase() ===
                            highlightSectionKey.toLowerCase(),
                        );

                        const card = (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            data-section-key={sectionKey}
                            style={
                              snapshot.isDragging
                                ? {
                                    ...(snapshot.isDropAnimating
                                      ? {
                                          ...dragProvided.draggableProps.style,
                                          transitionDuration: "0.001s",
                                        }
                                      : dragProvided.draggableProps.style),
                                    height: "auto",
                                    fontFamily: getCvFontFamilyCss(fontFamily),
                                    lineHeight,
                                    ["--cv-font-scale" as string]: fontScale,
                                    ["--cv-line-height" as string]: lineHeight,
                                    ["--cv-primary-1" as string]: `var(--cv-preview-primary-1, ${primaryColor})`,
                                    ["--cv-primary-2" as string]: `var(--cv-preview-primary-2, ${bannerBgColor})`,
                                  }
                                : snapshot.isDropAnimating
                                  ? {
                                      ...dragProvided.draggableProps.style,
                                      transitionDuration: "0.001s",
                                    }
                                  : dragProvided.draggableProps.style
                            }
                            className={`group relative scroll-mt-8 rounded-lg px-2 transition-all duration-200 ${
                              isActiveSuggestion
                                ? "border-2 border-primary bg-blue-50/10 shadow-xs ring-2 ring-primary/20"
                                : "hover:ring-1 hover:ring-slate-300"
                            } ${
                              snapshot.isDragging
                                ? "cv-page-container z-50 bg-white text-slate-900 opacity-95 shadow-2xl ring-2 ring-primary/40"
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
                              sectionKey={sectionKey}
                            />
                            {renderSectionContent(sectionKey)}
                          </div>
                        );

                        if (snapshot.isDragging) {
                          return createPortal(card, document.body);
                        }

                        return card;
                      }}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="space-y-2">
            {visibleSections.map((sectionKey) => {
              const isActiveSuggestion = Boolean(
                !isReadOnly &&
                highlightSectionKey &&
                sectionKey.toLowerCase() === highlightSectionKey.toLowerCase(),
              );
              return (
                <div
                  key={sectionKey}
                  data-section-key={sectionKey}
                  className={`relative scroll-mt-8 rounded-lg px-2 transition-all duration-200 ${
                    isActiveSuggestion
                      ? "border-2 border-primary bg-blue-50/10 shadow-xs ring-2 ring-primary/20"
                      : ""
                  }`}
                >
                  {renderSectionContent(sectionKey)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

ClassicHarvardTemplate.displayName = "ClassicHarvardTemplate";

export default ClassicHarvardTemplate;
