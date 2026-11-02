import React from "react";
import { Draggable, type DraggableStateSnapshot } from "@hello-pangea/dnd";
import DraggableSectionActions from "../../builder/components/DraggableSectionActions";

interface DraggableSectionCardProps {
  sectionKey: string;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isReadOnly: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  children: React.ReactNode;
}

/**
 * Xử lý style của Draggable:
 * 1. Tuyệt đối không dùng class CSS transition trên container của Draggable
 *    vì nó sẽ triệt tiêu transitionend của transform trong @hello-pangea/dnd,
 *    gây ra lỗi "thả chuột ra chưa drop, scroll mới drop".
 * 2. Khi snapshot.isDropAnimating, cưỡng chế transitionDuration = "0.001s"
 *    để drop kết thúc ngay lập tức (instant snap), không bao giờ bị treo.
 */
function getDraggableStyle(
  style: React.CSSProperties | undefined,
  snapshot: DraggableStateSnapshot,
): React.CSSProperties | undefined {
  if (!style) return style;

  if (snapshot.isDropAnimating) {
    return {
      ...style,
      transitionDuration: "0.001s",
    };
  }

  return style;
}

/**
 * DraggableSectionCard:
 * Tách biệt hoàn toàn vỏ kéo thả Draggable khỏi nội dung ruột của Section.
 * Khi snapshot.isDragging thay đổi, chỉ cập nhật trạng thái kéo thả mà không re-render children.
 */
export const DraggableSectionCard = React.memo<DraggableSectionCardProps>(
  ({
    sectionKey,
    index,
    isFirst,
    isLast,
    isReadOnly,
    onMoveUp,
    onMoveDown,
    onToggleVisibility,
    children,
  }) => {
    return (
      <Draggable
        draggableId={sectionKey}
        index={index}
        isDragDisabled={isReadOnly}
      >
        {(dragProvided, snapshot) => (
          <div
            ref={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            style={getDraggableStyle(dragProvided.draggableProps.style, snapshot)}
            className={`group relative rounded-sm hover:ring-1 hover:ring-slate-400 ${
              snapshot.isDragging
                ? "z-50 bg-white opacity-95 shadow-2xl ring-2 ring-primary/40"
                : ""
            }`}
          >
            <DraggableSectionActions
              dragHandleProps={dragProvided.dragHandleProps}
              isFirst={isFirst}
              isLast={isLast}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDelete={onToggleVisibility}
            />
            {children}
          </div>
        )}
      </Draggable>
    );
  },
);

DraggableSectionCard.displayName = "DraggableSectionCard";
