import { useEffect } from "react";
import { useCvHistory } from "../history";

interface UseCvHistoryHotkeysOptions {
  isLocked?: boolean;
  isPreviewOpen?: boolean;
}

/**
 * Kiểm tra xem phần tử mục tiêu có phải là thẻ nhập liệu thông thường không
 * (input, textarea, select), giữ nguyên hành vi Undo/Redo gốc của trình duyệt.
 */
function isStandardFormInput(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName?.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select";
}

/**
 * Hook quản lý các phím tắt Undo / Redo cho CV Builder:
 * - Windows / Linux: Ctrl+Z (Undo), Ctrl+Shift+Z hoặc Ctrl+Y (Redo)
 * - macOS: Cmd+Z (Undo), Cmd+Shift+Z (Redo)
 *
 * Tự động bỏ qua khi đang gõ IME (bộ gõ tiếng Việt / Telex / VNI),
 * bỏ qua khi focus trong input/textarea/select thông thường (tiêu đề CV, ô mã màu),
 * và không thực hiện khi CV đang bị khóa hoặc đang mở modal xem trước.
 */
export function useCvHistoryHotkeys({
  isLocked = false,
  isPreviewOpen = false,
}: UseCvHistoryHotkeysOptions = {}) {
  const { undo, redo } = useCvHistory();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Bỏ qua sự kiện trong lúc nhập bằng IME (bộ gõ tiếng Việt...)
      if (e.isComposing || e.keyCode === 229) {
        return;
      }

      // 2. Không bắt phím khi focus trong input, textarea hoặc select thông thường
      if (isStandardFormInput(e.target)) {
        return;
      }

      // 3. Nhận diện tổ hợp phím Undo/Redo
      const isMod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      const isUndo = isMod && !e.shiftKey && key === "z";
      const isRedo =
        (isMod && e.shiftKey && key === "z") ||
        (e.ctrlKey && !e.shiftKey && !e.metaKey && key === "y");

      if (!isUndo && !isRedo) {
        return;
      }

      // 4. Khi hotkey được nhận trong CV Builder, ngăn hành vi mặc định của trình duyệt
      // kể cả khi không còn command để Undo/Redo
      e.preventDefault();

      // 5. Bỏ qua nếu CV bị khóa hoặc modal xem trước đang mở
      if (isLocked || isPreviewOpen) {
        return;
      }

      // 6. Thực thi Undo hoặc Redo (hàm undo/redo đã tự động gọi flushPending())
      if (isUndo) {
        undo();
      } else if (isRedo) {
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo, isLocked, isPreviewOpen]);
}
