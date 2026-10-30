import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableSectionActionsProps {
  dragHandleProps: React.HTMLAttributes<HTMLDivElement> | null;
  isFirst: boolean;
  isLast: boolean;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onDelete: () => void;
}

function DraggableSectionActions({
  dragHandleProps,
  isFirst,
  isLast,
  onMoveDown,
  onMoveUp,
  onDelete,
}: DraggableSectionActionsProps) {
  const actionButtonClassName =
    "rounded-lg border border-border bg-surface p-1.5 shadow-sm hover:text-primary disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted";

  return (
    <div className="no-print absolute -top-1 left-0 -translate-y-full gap-1 hidden transition-opacity group-hover:flex focus-within:opacity-100">
      <div className="absolute left-0 bottom-0 translate-y-full w-full h-2 select-none" />
      
      <div
        {...dragHandleProps}
        title="Kéo để đổi vị trí mục"
        className="cursor-grab rounded-lg border border-border bg-surface p-1.5 text-text-muted shadow-sm hover:text-primary active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <button
        type="button"
        onClick={onMoveUp}
        disabled={isFirst}
        title="Đưa mục lên"
        aria-label="Đưa mục lên"
        className={cn("cursor-pointer", actionButtonClassName)}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={isLast}
        title="Đưa mục xuống"
        aria-label="Đưa mục xuống"
        className={cn("cursor-pointer", actionButtonClassName)}
      >
        <ArrowDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Xóa mục này"
        aria-label="Xóa mục này"
        className="rounded-lg border border-border bg-surface p-1.5 text-status-error shadow-sm hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4 cursor-pointer" />
      </button>
    </div>
  );
}

export default DraggableSectionActions;
