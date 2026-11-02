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

    const isSectionVisible = (key: string): boolean => {
      const sec = sections[key as keyof typeof sections];
      if (!sec || typeof sec !== "object") return true;
      return (sec as { visible?: boolean }).visible !== false;
    };

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
              minHeight: "unset",
              width: "max-content",
              maxWidth: "280px",
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

            // Chiều cao chuẩn xác của section đang kéo do thư viện dnd tính toán
            const dndPlaceholderHeight = (provided.placeholder as unknown as {
              props?: {
                placeholder?: {
                  client?: {
                    borderBox?: {
                      height?: number;
                    };
                  };
                };
              };
            })?.props?.placeholder?.client?.borderBox?.height;

            const dropZoneHeight =
              typeof dndPlaceholderHeight === "number" && dndPlaceholderHeight > 0
                ? dndPlaceholderHeight
                : activeDrag?.draggedHeight || 140;

            let indicatorTop = 0;
            if (
              isDropTarget &&
              containerRef.current &&
              activeDrag &&
              activeDrag.destinationIndex != null
            ) {
              const destIndex = activeDrag.destinationIndex;
              if (destIndex > 0) {
                const children = Array.from(
                  containerRef.current.querySelectorAll<HTMLElement>(
                    ":scope > [data-rfd-draggable-id]",
                  ),
                );
                if (children.length > 0) {
                  const prevIndex = Math.min(
                    destIndex - 1,
                    children.length - 1,
                  );
                  const prevEl = children[prevIndex];
                  if (prevEl) {
                    const style = window.getComputedStyle(prevEl);
                    const marginBottom = parseFloat(style.marginBottom) || 0;
                    indicatorTop =
                      prevEl.offsetTop + prevEl.offsetHeight + marginBottom / 2;
                  }
                }
              }
            }

            return (
              <div
                {...provided.droppableProps}
                ref={(el) => {
                  containerRef.current = el;
                  provided.innerRef(el);
                }}
                className="relative min-h-[120px]"
              >
                {/* Bóng thả nét đứt hiển thị chính xác và phủ kín 100% toàn bộ vùng trống có thể thả */}
                {isDropTarget && activeDrag && (
                  <div
                    style={{
                      position: "absolute",
                      top: indicatorTop,
                      left: 0,
                      right: 0,
                      height: dropZoneHeight,
                    }}
                    className="pointer-events-none rounded-sm border-2 border-dashed border-slate-400 bg-slate-200/50 shadow-inner"
                  />
                )}

                {sectionsList.map((sectionKey, index) => {
                  const visible = isSectionVisible(sectionKey);
                  return (
                    <DraggableSectionCard
                      key={sectionKey}
                      sectionKey={sectionKey}
                      index={index}
                      isFirst={index === 0}
                      isLast={index === sectionsList.length - 1}
                      visible={visible}
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
        {sectionsList
          .filter((sectionKey) => isSectionVisible(sectionKey))
          .map((sectionKey) => (
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
