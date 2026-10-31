import React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemActionsProps {
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAddAfter?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  className?: string;
}

export const ItemActions: React.FC<ItemActionsProps> = ({
  isFirst = false,
  isLast = false,
  onMoveUp,
  onMoveDown,
  onAddAfter,
  onDelete,
  canDelete = true,
  className,
}) => {
  const actionBtnClass =
    "rounded-sm border border-border bg-surface p-1 shadow-sm hover:text-primary transition-all disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted";

  return (
    <div
      className={cn(
        "no-print focus-within/item:opacity-100 absolute -top-2 right-0 z-20 hidden -translate-y-full items-center gap-1 transition-opacity group-hover/item:flex",
        className,
      )}
    >
      <div className="absolute left-0 bottom-0 translate-y-full w-full h-2 select-none" />

      {/* Nút Di chuyển lên */}
      {onMoveUp && (
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          title="Đưa lên trên"
          aria-label="Đưa lên trên"
          className={cn("cursor-pointer", actionBtnClass)}
        >
          <ArrowUp className="h-4.5 w-4.5" />
        </button>
      )}

      {/* Nút Di chuyển xuống */}
      {onMoveDown && (
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          title="Đưa xuống dưới"
          aria-label="Đưa xuống dưới"
          className={cn("cursor-pointer", actionBtnClass)}
        >
          <ArrowDown className="h-4.5 w-4.5" />
        </button>
      )}

      {/* Nút Xóa: chỉ hiện khi có nhiều hơn 1 item */}
      {onDelete && canDelete && (
        <button
          type="button"
          onClick={onDelete}
          title="Xóa mục này"
          aria-label="Xóa mục này"
          className="cursor-pointer rounded-sm border border-border bg-surface p-1 text-status-error shadow-sm transition-all hover:bg-red-50"
        >
          <Trash2 className="h-4.5 w-4.5" />
        </button>
      )}

      {/* Nút Thêm: chèn item ngay phía sau item này */}
      {onAddAfter && (
        <button
          type="button"
          onClick={onAddAfter}
          title="Thêm mục mới ngay phía dưới"
          aria-label="Thêm mục mới ngay phía dưới"
          className={cn(
            "cursor-pointer text-primary hover:bg-sky-50",
            actionBtnClass,
          )}
        >
          <Plus className="h-4.5 w-4.5" />
        </button>
      )}
    </div>
  );
};

export default ItemActions;
