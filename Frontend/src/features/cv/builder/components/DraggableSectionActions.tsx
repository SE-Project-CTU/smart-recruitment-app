import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionAiSuggestionButton } from "./assistant/SectionAiSuggestionButton";
import { useCvHighlightStore } from "@/stores/cvHighlightStore";

interface DraggableSectionActionsProps {
  dragHandleProps: React.HTMLAttributes<HTMLDivElement> | null;
  isFirst: boolean;
  isLast: boolean;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onDelete: () => void;
  sectionKey?: string;
}

function DraggableSectionActions({
  dragHandleProps,
  isFirst,
  isLast,
  onMoveDown,
  onMoveUp,
  onDelete,
  sectionKey,
}: DraggableSectionActionsProps) {
  const isActive = useCvHighlightStore(
    (s) =>
      Boolean(
        sectionKey &&
          s.highlightSectionKey &&
          sectionKey.toLowerCase() === s.highlightSectionKey.toLowerCase(),
      ),
  );

  const actionButtonClassName =
    "rounded-lg border border-border bg-surface p-1.5 shadow-sm hover:text-primary disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted";

  return (
    <div
      className={cn(
        "no-print absolute -top-1 left-0 right-0 -translate-y-full items-center justify-between pointer-events-none transition-opacity",
        isActive
          ? "flex"
          : "hidden group-hover:flex focus-within:opacity-100",
      )}
    >
      <div className="pointer-events-auto absolute left-0 bottom-0 h-2 w-full translate-y-full select-none" />

      {/* Nhóm thao tác bên trái: Khi isActive thì chỉ hiện khi hover để giao diện sạch sẽ */}
      <div
        className={cn(
          "flex items-center gap-1 pointer-events-auto transition-opacity",
          isActive ? "opacity-0 group-hover:opacity-100" : "opacity-100",
        )}
      >
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

      {/* Nút Xem gợi ý bên phải */}
      {sectionKey && (
        <div className="relative pointer-events-auto">
          <div className="pointer-events-auto absolute left-0 bottom-0 h-2 w-full translate-y-full select-none" />
          <SectionAiSuggestionButton sectionKey={sectionKey} />
        </div>
      )}
    </div>
  );
}

export default DraggableSectionActions;
