import {
  Draggable,
  type DraggableChildrenFn,
  type DraggableProps,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

import { GripVertical, SeparatorHorizontal, Trash2 } from "lucide-react";

export interface DraggableSectionProps extends Omit<
  DraggableProps,
  "children"
> {
  className?: string;
  children: DraggableChildrenFn;
}

function DraggableSection({
  className,
  children,
  ...props
}: DraggableSectionProps) {
  return (
    <Draggable {...props}>
      {(provided, snapshot, rubric) => (
        <>
          <div className="no-print absolute top-2 -left-10 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <div
              {...provided.dragHandleProps}
              title="Kéo để đổi vị trí mục"
              className="cursor-grab rounded-lg border border-border bg-surface p-1.5 text-text-muted shadow-sm hover:text-primary active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <button
              type="button"
              onClick={() => {}}
              title="Đẩy mục này sang đầu trang A4 tiếp theo"
              className={`rounded-lg border border-border p-1.5 shadow-sm transition-colors`}
            >
              <SeparatorHorizontal className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {}}
              title="Xóa mục này"
              className="rounded-lg border border-border bg-surface p-1.5 text-status-error shadow-sm hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={cn(className)}
          >
            {children(provided, snapshot, rubric)}
          </div>
        </>
      )}
    </Draggable>
  );
}

export default DraggableSection;
