import {
  Draggable,
  type DraggableChildrenFn,
  type DraggableProps,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import DraggableSectionActions from "./draggable-section-actions";
import type { CVSectionKey } from "@/types/cv";

export interface DraggableSectionProps extends Omit<
  DraggableProps,
  "children" | "draggableId"
> {
  className?: string;
  children: DraggableChildrenFn;
  draggableId: string;
  isFirst?: boolean;
  isLast?: boolean;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onDelete: (key: CVSectionKey) => void;
}

function DraggableSection({
  className,
  children,
  draggableId,
  isFirst = false,
  isLast = false,
  onMoveDown = () => {},
  onMoveUp = () => {},
  onDelete = () => {},
  ...props
}: DraggableSectionProps) {
  return (
    <Draggable draggableId={draggableId} {...props}>
      {(provided, snapshot, rubric) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "h-fit rounded-sm border border-white px-4 py-2 hover:border-slate-400",
            className,
          )}
        >
          <DraggableSectionActions
            dragHandleProps={provided.dragHandleProps}
            isFirst={isFirst}
            isLast={isLast}
            onMoveDown={onMoveDown}
            onMoveUp={onMoveUp}
            onDelete={() => onDelete(draggableId as CVSectionKey)}
          />

          {children(provided, snapshot, rubric)}
        </div>
      )}
    </Draggable>
  );
}

export default DraggableSection;
