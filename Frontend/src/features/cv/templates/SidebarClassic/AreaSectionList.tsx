import React, { useCallback, useRef } from "react";
import {
  Droppable,
  type DraggableProvided,
  type DraggableRubric,
  type DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import type { FixedSectionKey } from "../../types";
import type { RichTextCVSections } from "@/types/cv";
import { extractTiptapPlainText } from "../../builder/utils/tiptapJson";
import type { CvFieldRenderer, CvSectionEditorsMap } from "../types";
import { DraggableSectionCard } from "./DraggableSectionCard";
import { SectionRenderer } from "./SectionRenderer";

/**
 * Thông tin chi tiết về phần tử và vị trí đang được kéo thả
 */
export interface ActiveDragInfo {
  draggableId: string;
  draggedHeight: number;
  sourceDroppableId: string;
  destinationDroppableId?: string | null;
  destinationIndex?: number | null;
}

/**
 * Bảng tên tiếng Việt mặc định cho từng section trong Sidebar Classic
 * khi tiêu đề section đang lưu trong CV trống.
 */
const DEFAULT_SECTION_TITLES: Record<string, string> = {
  objective: "Mục tiêu nghề nghiệp",
  education: "Học vấn",
  experience: "Kinh nghiệm làm việc",
  skills: "Kỹ năng",
  projects: "Hoạt động",
  certifications: "Chứng chỉ",
  awards: "Danh hiệu và giải thưởng",
  interests: "Sở thích",
  additionalInfo: "Người giới thiệu",
};

/**
 * Lấy tiêu đề hiển thị cho section từ CV data:
 * Ưu tiên plain text từ section.title, nếu rỗng thì fallback tên mặc định tiếng Việt.
 */
function getSectionDisplayTitle(
  sectionKey: string,
  sections: RichTextCVSections,
): string {
  const section = sections[sectionKey as keyof RichTextCVSections];
  if (
    section &&
    typeof section === "object" &&
    "title" in section &&
    section.title
  ) {
    const plainText = extractTiptapPlainText(section.title).trim();
    if (plainText) return plainText;
  }
  return DEFAULT_SECTION_TITLES[sectionKey] || sectionKey;
}

interface AreaSectionListProps {
  areaId: string;
  sectionsList: string[];
  sections: RichTextCVSections;
  primaryColor?: string;
  isReadOnly?: boolean;
  canDrag: boolean;
  activeDrag?: ActiveDragInfo | null;
  renderField: CvFieldRenderer;
  sectionEditors?: Partial<CvSectionEditorsMap>;
  onMoveSectionInArea: (
    areaId: string,
    index: number,
    direction: "up" | "down",
  ) => void;
  onToggleSectionVisibility?: (sectionKey: FixedSectionKey) => void;
}

/**
 * AreaSectionList:
 * Danh sách kéo thả riêng biệt cho từng area (sidebar hoặc main).
 * Bọc Droppable và render các DraggableSectionCard.
 * Được bọc React.memo để tránh re-render khi area khác thay đổi.
 */
/**
 * Lấy tọa độ top và bottom thực tế của element trong layout,
 * loại trừ hoàn toàn độ dịch chuyển tức thời do CSS transform (translate)
 * mà @hello-pangea/dnd đang áp dụng trong quá trình animation kéo thả.
 */
function getUntransformedElementBounds(el: HTMLElement): {
  top: number;
  bottom: number;
} {
  const rect = el.getBoundingClientRect();
  let ty = 0;

  // 1. Đọc từ getComputedStyle (chuẩn hóa matrix/matrix3d)
  const computedStyle = window.getComputedStyle(el);
  const transform = computedStyle.transform;
  if (transform && transform !== "none") {
    const m = transform.match(/^matrix\((.+)\)$/);
    if (m) {
      const parts = m[1].split(",");
      ty = parseFloat(parts[5]) || 0;
    } else {
      const m3d = transform.match(/^matrix3d\((.+)\)$/);
      if (m3d) {
        const parts = m3d[1].split(",");
        ty = parseFloat(parts[13]) || 0;
      }
    }
  }

  // 2. Fallback đọc từ inline style nếu browser chưa render xong computed style
  if (ty === 0 && el.style.transform) {
    const inlineMatch = el.style.transform.match(
      /translate(?:3d)?\([^,]+,\s*([-\d.]+)px/,
    );
    if (inlineMatch) {
      ty = parseFloat(inlineMatch[1]) || 0;
    }
  }

  return {
    top: rect.top - ty,
    bottom: rect.bottom - ty,
  };
}

export const AreaSectionList = React.memo<AreaSectionListProps>(
  ({
    areaId,
    sectionsList,
    sections,
    primaryColor,
    isReadOnly = false,
    canDrag,
    activeDrag,
    renderField,
    sectionEditors,
    onMoveSectionInArea,
    onToggleSectionVisibility,
  }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const isSectionVisible = useCallback(
      (key: string): boolean => {
        const sec = sections[key as keyof typeof sections];
        if (!sec || typeof sec !== "object") return true;
        return (sec as { visible?: boolean }).visible !== false;
      },
      [sections],
    );

    // Chỉ render các section đang hiển thị; section bị tắt hiển thị sẽ bị loại bỏ hoàn toàn khỏi CV
    const visibleSections = React.useMemo(
      () => sectionsList.filter(isSectionVisible),
      [sectionsList, isSectionVisible],
    );

    /**
     * renderClone:
     * Dùng renderClone của @hello-pangea/dnd để khi kéo section,
     * phần hiển thị theo con trỏ chỉ là huy hiệu nhỏ gọn vừa vặn ôm khít tên section,
     * thay vì kéo theo toàn bộ nội dung thật của section.
     */
    const renderClone = useCallback(
      (
        dragProvided: DraggableProvided,
        snapshot: DraggableStateSnapshot,
        rubric: DraggableRubric,
      ) => {
        const title = getSectionDisplayTitle(rubric.draggableId, sections);
        return (
          <div
            ref={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            {...dragProvided.dragHandleProps}
            style={{
              ...dragProvided.draggableProps.style,
              height: "auto",
              maxHeight: "40px",
              minHeight: "unset",
              width: "max-content",
              maxWidth: "280px",
              boxSizing: "border-box",
              ...(snapshot.isDropAnimating
                ? { transitionDuration: "0.001s" }
                : {}),
            }}
            className="pointer-events-none z-50 flex w-fit max-w-xs select-none items-center gap-2 rounded-sm border border-slate-700 bg-slate-900/95 px-3 py-1.5 text-white shadow-xl backdrop-blur-sm"
          >
            <GripVertical className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate text-xs font-semibold uppercase tracking-wider">
              {title}
            </span>
          </div>
        );
      },
      [sections],
    );

    if (canDrag) {
      return (
        <Droppable
          droppableId={areaId}
          isDropDisabled={isReadOnly}
          renderClone={renderClone}
        >
          {(provided, snapshot) => {
            const isDropTarget =
              Boolean(snapshot.isDraggingOver) &&
              activeDrag?.destinationDroppableId === areaId &&
              activeDrag?.destinationIndex != null;

            let indicatorTop = 0;
            let indicatorHeight = 0;

            if (
              isDropTarget &&
              containerRef.current &&
              activeDrag &&
              activeDrag.destinationIndex != null
            ) {
              const destIndex = activeDrag.destinationIndex;
              // Lấy danh sách các thẻ section thực tế trong container (loại bỏ thẻ đang được kéo)
              const sectionEls = Array.from(
                containerRef.current.children,
              ).filter(
                (el): el is HTMLElement =>
                  el instanceof HTMLElement &&
                  el.hasAttribute("data-rfd-draggable-id") &&
                  el.getAttribute("data-rfd-draggable-id") !==
                    activeDrag.draggableId,
              );

              const containerRect =
                containerRef.current.getBoundingClientRect();

              // Chiều cao bóng thả bằng đúng chiều cao của section thật đang kéo (trừ 4px lề thở trên dưới)
              const dropHeight = Math.max(activeDrag.draggedHeight || 100, 40);
              indicatorHeight = Math.max(dropHeight - 4, 36);

              if (sectionEls.length === 0) {
                indicatorTop = 0;
              } else if (destIndex <= 0) {
                // Drop ở đầu danh sách: đặt ở đầu container
                indicatorTop = 0;
              } else if (destIndex >= sectionEls.length) {
                // Drop ở cuối danh sách: đặt phía dưới section cuối cùng (lấy tọa độ tĩnh không dính transform)
                const lastEl = sectionEls[sectionEls.length - 1];
                const lastBounds = getUntransformedElementBounds(lastEl);
                indicatorTop = Math.max(0, lastBounds.bottom - containerRect.top + 2);
              } else {
                // Drop giữa 2 section: đặt ngay dưới section phía trên (lấy tọa độ tĩnh không dính transform)
                const prevEl = sectionEls[destIndex - 1];
                if (prevEl) {
                  const prevBounds = getUntransformedElementBounds(prevEl);
                  indicatorTop = Math.max(0, prevBounds.bottom - containerRect.top + 2);
                }
              }
            }

            const activeColor = primaryColor || "var(--cv-primary-1, #262626)";

            return (
              <div
                {...provided.droppableProps}
                ref={(el) => {
                  containerRef.current = el;
                  provided.innerRef(el);
                }}
                className="relative min-h-[120px]"
              >
                {/* Bóng thả nét đứt hiển thị chuẩn xác, vừa vặn trong khoảng hở giữa 2 section, không đè lên nội dung */}
                {isDropTarget && activeDrag && indicatorHeight > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: indicatorTop,
                      left: 0,
                      right: 0,
                      height: indicatorHeight,
                      borderColor: activeColor,
                      backgroundColor:
                        indicatorHeight > 10
                          ? "color-mix(in srgb, var(--cv-primary-1, #262626) 8%, transparent)"
                          : activeColor,
                    }}
                    className={`pointer-events-none z-10 rounded-sm shadow-sm transition-[top,height] duration-75 ${
                      indicatorHeight > 10
                        ? "border-2 border-dashed"
                        : "h-1 rounded-full opacity-80"
                    }`}
                  />
                )}

                {visibleSections.map((sectionKey, index) => {
                  return (
                    <DraggableSectionCard
                      key={sectionKey}
                      sectionKey={sectionKey}
                      index={index}
                      isFirst={index === 0}
                      isLast={index === visibleSections.length - 1}
                      isReadOnly={isReadOnly}
                      onMoveUp={() => onMoveSectionInArea(areaId, index, "up")}
                      onMoveDown={() =>
                        onMoveSectionInArea(areaId, index, "down")
                      }
                      onToggleVisibility={() =>
                        onToggleSectionVisibility?.(
                          sectionKey as FixedSectionKey,
                        )
                      }
                    >
                      <SectionRenderer
                        sectionKey={sectionKey}
                        sections={sections}
                        primaryColor={primaryColor}
                        isReadOnly={isReadOnly}
                        renderField={renderField}
                        sectionEditors={sectionEditors}
                      />
                    </DraggableSectionCard>
                  );
                })}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
      );
    }

    return (
      <div>
        {visibleSections.map((sectionKey) => (
          <div key={sectionKey} className="relative rounded-sm">
            <SectionRenderer
              sectionKey={sectionKey}
              sections={sections}
              primaryColor={primaryColor}
              isReadOnly={isReadOnly}
              renderField={renderField}
              sectionEditors={sectionEditors}
            />
          </div>
        ))}
      </div>
    );
  },
);

AreaSectionList.displayName = "AreaSectionList";
