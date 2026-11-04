import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useFormContext, type FieldPath } from "react-hook-form";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";
import {
  type CvCommand,
  UpdateCvFieldCommand,
} from "./commands";

const MAX_HISTORY_LENGTH = 100;
const FIELD_DEBOUNCE_MS = 300;

interface PendingFieldUpdate {
  fieldName: FieldPath<RichTextCvEditorValues>;
  initialValue: unknown;
  latestValue: unknown;
  timerId: ReturnType<typeof setTimeout> | null;
}

export interface CvHistoryContextValue {
  canUndo: boolean;
  canRedo: boolean;
  executeCommand: (command: CvCommand) => void;
  recordFieldChange: (
    fieldName: FieldPath<RichTextCvEditorValues>,
    newValue: unknown,
    currentValueBeforeChange: unknown,
  ) => void;
  flushPending: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

const CvHistoryContext = createContext<CvHistoryContextValue | null>(null);

export const CvHistoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { setValue } = useFormContext<RichTextCvEditorValues>();
  const [undoStack, setUndoStack] = useState<CvCommand[]>([]);
  const [redoStack, setRedoStack] = useState<CvCommand[]>([]);
  const pendingRef = useRef<PendingFieldUpdate | null>(null);

  // Chốt pending command (nếu có) vào undoStack
  const flushPending = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return;

    if (pending.timerId) {
      clearTimeout(pending.timerId);
    }
    pendingRef.current = null;

    // So sánh xem giá trị có thực sự thay đổi không
    const isDifferent =
      JSON.stringify(pending.initialValue) !==
      JSON.stringify(pending.latestValue);

    if (isDifferent) {
      const command = new UpdateCvFieldCommand(
        pending.fieldName,
        pending.initialValue,
        pending.latestValue,
        setValue,
      );

      setUndoStack((prev) => {
        const next = [...prev, command];
        return next.length > MAX_HISTORY_LENGTH
          ? next.slice(next.length - MAX_HISTORY_LENGTH)
          : next;
      });
      setRedoStack([]);
    }
  }, [setValue]);

  // Ghi nhận thay đổi khi người dùng gõ vào một trường văn bản
  const recordFieldChange = useCallback(
    (
      fieldName: FieldPath<RichTextCvEditorValues>,
      newValue: unknown,
      currentValueBeforeChange: unknown,
    ) => {
      const pending = pendingRef.current;

      // Nếu đang pending một trường khác, chốt trường cũ trước
      if (pending && pending.fieldName !== fieldName) {
        flushPending();
      }

      const activePending = pendingRef.current;
      if (activePending && activePending.fieldName === fieldName) {
        if (activePending.timerId) {
          clearTimeout(activePending.timerId);
        }
        activePending.latestValue = newValue;
        activePending.timerId = setTimeout(() => {
          flushPending();
        }, FIELD_DEBOUNCE_MS);
      } else {
        const newPending: PendingFieldUpdate = {
          fieldName,
          initialValue: currentValueBeforeChange,
          latestValue: newValue,
          timerId: setTimeout(() => {
            flushPending();
          }, FIELD_DEBOUNCE_MS),
        };
        pendingRef.current = newPending;
      }
    },
    [flushPending],
  );

  // Thực thi một command bất kỳ (thao tác thiết kế, cấu trúc, thêm/xóa/sắp xếp item)
  const executeCommand = useCallback(
    (command: CvCommand) => {
      flushPending();
      command.execute();
      setUndoStack((prev) => {
        const next = [...prev, command];
        return next.length > MAX_HISTORY_LENGTH
          ? next.slice(next.length - MAX_HISTORY_LENGTH)
          : next;
      });
      setRedoStack([]);
    },
    [flushPending],
  );

  // Undo: Chốt pending trước, sau đó lấy lệnh từ đỉnh undoStack
  const undo = useCallback(() => {
    flushPending();

    setUndoStack((prevUndo) => {
      if (prevUndo.length === 0) return prevUndo;

      const newUndo = [...prevUndo];
      const command = newUndo.pop();
      if (!command) return prevUndo;

      command.undo();
      setRedoStack((prevRedo) => [...prevRedo, command]);
      return newUndo;
    });
  }, [flushPending]);

  // Redo: Chốt pending trước, sau đó lấy lệnh từ đỉnh redoStack
  const redo = useCallback(() => {
    flushPending();

    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;

      const newRedo = [...prevRedo];
      const command = newRedo.pop();
      if (!command) return prevRedo;

      command.redo();
      setUndoStack((prevUndo) => {
        const next = [...prevUndo, command];
        return next.length > MAX_HISTORY_LENGTH
          ? next.slice(next.length - MAX_HISTORY_LENGTH)
          : next;
      });
      return newRedo;
    });
  }, [flushPending]);

  // Xóa toàn bộ lịch sử khi lưu CV thành công
  const clearHistory = useCallback(() => {
    if (pendingRef.current?.timerId) {
      clearTimeout(pendingRef.current.timerId);
    }
    pendingRef.current = null;
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (pendingRef.current?.timerId) {
        clearTimeout(pendingRef.current.timerId);
      }
    };
  }, []);

  const canUndo = undoStack.length > 0 || pendingRef.current !== null;
  const canRedo = redoStack.length > 0;

  return (
    <CvHistoryContext.Provider
      value={{
        canUndo,
        canRedo,
        executeCommand,
        recordFieldChange,
        flushPending,
        undo,
        redo,
        clearHistory,
      }}
    >
      {children}
    </CvHistoryContext.Provider>
  );
};

export function useCvHistory(): CvHistoryContextValue {
  const context = useContext(CvHistoryContext);
  if (!context) {
    throw new Error("useCvHistory must be used within a CvHistoryProvider");
  }
  return context;
}
