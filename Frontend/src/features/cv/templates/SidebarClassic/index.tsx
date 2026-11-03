import React, { useCallback, useRef, useState } from "react";
import {
  DragDropContext,
  type BeforeCapture,
  type DragStart,
  type DragUpdate,
  type DropResult,
} from "@hello-pangea/dnd";
import { SidebarProfile } from "./SidebarProfile";
import { AreaSectionList, type ActiveDragInfo } from "./AreaSectionList";
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
 * Cột sidebar: Nền xám (#EBECEE), chữ đen, tiêu đề khối chữ nhật đen chữ trắng.
 * Cột main: Nền trắng, tiêu đề khối chữ nhật đen chữ trắng.
 * Được tối ưu hóa kéo thả với memoization cho từng danh sách và section.
 */
export const SidebarClassicTemplate = React.memo<CvTemplateProps>(
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
    const [activeDrag, setActiveDrag] = useState<ActiveDragInfo | null>(null);
    const measuredHeightsRef = useRef<Record<string, number>>({});

    const handleBeforeCapture = useCallback((before: BeforeCapture) => {
      const el = document.querySelector<HTMLElement>(
        `[data-rfd-draggable-id="${before.draggableId}"]`,
      );
      if (el) {
        measuredHeightsRef.current[before.draggableId] =
          el.getBoundingClientRect().height;
      }
    }, []);

    const handleDragStart = useCallback((start: DragStart) => {
      let height = measuredHeightsRef.current[start.draggableId];
      if (!height) {
        const el = document.querySelector<HTMLElement>(
          `[data-rfd-draggable-id="${start.draggableId}"]`,
        );
        if (el) {
          height = el.getBoundingClientRect().height;
          measuredHeightsRef.current[start.draggableId] = height;
        }
      }
      setActiveDrag({
        draggableId: start.draggableId,
        draggedHeight: height || 140,
        sourceDroppableId: start.source.droppableId,
        destinationDroppableId: start.source.droppableId,
        destinationIndex: start.source.index,
      });
    }, []);

    const handleDragUpdate = useCallback((update: DragUpdate) => {
      setActiveDrag((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          destinationDroppableId: update.destination?.droppableId ?? null,
          destinationIndex: update.destination?.index ?? null,
        };
      });
    }, []);

    const isSectionVisible = useCallback(
      (key: string): boolean => {
        const sec = content?.sections?.[key as keyof typeof content.sections];
        if (!sec || typeof sec !== "object") return true;
        return (sec as { visible?: boolean }).visible !== false;
      },
      [content],
    );

    const handleDragEnd = useCallback(
      (result: DropResult) => {
        setActiveDrag(null);
        if (!result.destination || isReadOnly) return;
        const sourceAreaId = result.source.droppableId;
        const destAreaId = result.destination.droppableId;
        const sourceIndex = result.source.index;
        const destIndex = result.destination.index;

        if (sourceAreaId === destAreaId) {
          if (sourceIndex === destIndex) return;
          const targetArea = layout?.areas?.find((a) => a.id === sourceAreaId);
          if (!targetArea) return;
          const visibleSections = targetArea.sections.filter(isSectionVisible);
          const [removed] = visibleSections.splice(sourceIndex, 1);
          if (removed) {
            visibleSections.splice(destIndex, 0, removed);
            const hiddenSections = targetArea.sections.filter(
              (k) => !isSectionVisible(k),
            );
            const reordered = [...visibleSections, ...hiddenSections];
            onReorderAreaSections?.(sourceAreaId, reordered);
          }
        } else {
          const sourceArea = layout?.areas?.find((a) => a.id === sourceAreaId);
          const destArea = layout?.areas?.find((a) => a.id === destAreaId);
          if (!sourceArea || !destArea) return;

          const sourceSections = sourceArea.sections as string[];
          const sourceVisible = sourceSections.filter(isSectionVisible);
          const moved = sourceVisible[sourceIndex];
          if (!moved) return;

          const rawSourceIndex = sourceSections.indexOf(moved);
          const destSections = destArea.sections as string[];
          const destVisible = destSections.filter(isSectionVisible);
          let rawDestIndex: number;
          if (destIndex < destVisible.length) {
            const targetItem = destVisible[destIndex];
            rawDestIndex = destSections.indexOf(targetItem);
          } else {
            if (destVisible.length > 0) {
              const lastVisible = destVisible[destVisible.length - 1];
              rawDestIndex = destSections.indexOf(lastVisible) + 1;
            } else {
              rawDestIndex = 0;
            }
          }

          onMoveSectionBetweenAreas?.(
            sourceAreaId,
            destAreaId,
            rawSourceIndex,
            rawDestIndex,
          );
        }
      },
      [
        isReadOnly,
        isSectionVisible,
        layout?.areas,
        onReorderAreaSections,
        onMoveSectionBetweenAreas,
      ],
    );

    const moveSectionInArea = useCallback(
      (areaId: string, visibleIndex: number, direction: "up" | "down") => {
        const targetArea = layout?.areas?.find((a) => a.id === areaId);
        if (!targetArea) return;
        const visibleSections = targetArea.sections.filter(isSectionVisible);
        const newVisibleIndex =
          direction === "up" ? visibleIndex - 1 : visibleIndex + 1;
        if (newVisibleIndex < 0 || newVisibleIndex >= visibleSections.length)
          return;
        const [removed] = visibleSections.splice(visibleIndex, 1);
        if (removed) {
          visibleSections.splice(newVisibleIndex, 0, removed);
          const hiddenSections = targetArea.sections.filter(
            (k) => !isSectionVisible(k),
          );
          const reordered = [...visibleSections, ...hiddenSections];
          onReorderAreaSections?.(areaId, reordered);
        }
      },
      [isSectionVisible, layout?.areas, onReorderAreaSections],
    );

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

    const canDrag =
      !isReadOnly &&
      Boolean(onReorderAreaSections || onMoveSectionBetweenAreas);

    const sidebarSections = sidebarArea.sections as string[];
    const mainSections = mainArea.sections as string[];

    return (
      <div
        className={`cv-page-container mx-auto min-h-[297mm] w-[210mm] bg-white text-slate-900 shadow-xl print:m-0 print:shadow-none flex ${className}`}
        style={{
          fontFamily: getCvFontFamilyCss(fontFamily),
          lineHeight,
          ["--cv-font-scale" as string]: fontScale,
          ["--cv-line-height" as string]: lineHeight,
        }}
      >
        {canDrag ? (
          <DragDropContext
            onBeforeCapture={handleBeforeCapture}
            onDragStart={handleDragStart}
            onDragUpdate={handleDragUpdate}
            onDragEnd={handleDragEnd}
          >
            {/* Cột Sidebar bên trái: Chiều rộng 39%, nền xám (#EBECEE) */}
            <aside className="w-[39%] bg-[#EBECEE] px-6 py-8 shrink-0 flex flex-col">
              <SidebarProfile
                profile={profile}
                primaryColor={primaryColor}
                isReadOnly={isReadOnly}
                renderField={renderField}
              />
              <div className="mt-2 flex-1">
                <AreaSectionList
                  areaId={SIDEBAR_AREA_ID}
                  sectionsList={sidebarSections}
                  sections={sections}
                  primaryColor={primaryColor}
                  isReadOnly={isReadOnly}
                  canDrag={canDrag}
                  activeDrag={activeDrag}
                  renderField={renderField}
                  sectionEditors={sectionEditors}
                  onMoveSectionInArea={moveSectionInArea}
                  onToggleSectionVisibility={onToggleSectionVisibility}
                />
              </div>
            </aside>

            {/* Cột Main bên phải: Chiều rộng 61%, nền trắng */}
            <main className="w-[61%] px-7 py-8 flex-1 flex flex-col bg-white">
              <AreaSectionList
                areaId={MAIN_AREA_ID}
                sectionsList={mainSections}
                sections={sections}
                primaryColor={primaryColor}
                isReadOnly={isReadOnly}
                canDrag={canDrag}
                activeDrag={activeDrag}
                renderField={renderField}
                sectionEditors={sectionEditors}
                onMoveSectionInArea={moveSectionInArea}
                onToggleSectionVisibility={onToggleSectionVisibility}
              />
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
                <AreaSectionList
                  areaId={SIDEBAR_AREA_ID}
                  sectionsList={sidebarSections}
                  sections={sections}
                  primaryColor={primaryColor}
                  isReadOnly={isReadOnly}
                  canDrag={false}
                  renderField={renderField}
                  sectionEditors={sectionEditors}
                  onMoveSectionInArea={moveSectionInArea}
                  onToggleSectionVisibility={onToggleSectionVisibility}
                />
              </div>
            </aside>

            <main className="w-[61%] px-7 py-8 flex-1 flex flex-col bg-white">
              <AreaSectionList
                areaId={MAIN_AREA_ID}
                sectionsList={mainSections}
                sections={sections}
                primaryColor={primaryColor}
                isReadOnly={isReadOnly}
                canDrag={false}
                renderField={renderField}
                sectionEditors={sectionEditors}
                onMoveSectionInArea={moveSectionInArea}
                onToggleSectionVisibility={onToggleSectionVisibility}
              />
            </main>
          </>
        )}
      </div>
    );
  },
);

SidebarClassicTemplate.displayName = "SidebarClassicTemplate";

export default SidebarClassicTemplate;
