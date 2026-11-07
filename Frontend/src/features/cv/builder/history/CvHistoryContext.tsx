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
  const historyRef = useRef<{ undo: CvCommand[]; redo: CvCommand[] }>({
    undo: [],
    redo: [],
  });
  const [{ canUndo, canRedo }, setAvailability] = useState({
    canUndo: false,
    canRedo: false,
  });
  const pendingRef = useRef<PendingFieldUpdate | null>(null);

  const syncAvailability = useCallback(() => {
    const pending = pendingRef.current;
    const hasPendingChange = pending !== null &&
      JSON.stringify(pending.initialValue) !== JSON.stringify(pending.latestValue);
    setAvailability({
      canUndo: historyRef.current.undo.length > 0 || hasPendingChange,
      canRedo: historyRef.current.redo.length > 0 && !hasPendingChange,
    });
  }, []);

  // Cập nhật lịch sử đồng bộ để thao tác tiếp theo luôn đọc đúng lệnh mới nhất.
  const pushUndo = useCallback((command: CvCommand) => {
    historyRef.current = {
      undo: [...historyRef.current.undo, command].slice(-MAX_HISTORY_LENGTH),
      redo: [],
    };
    syncAvailability();
  }, [syncAvailability]);

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

      pushUndo(command);
    }
    syncAvailability();
  }, [setValue, pushUndo, syncAvailability]);

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
      syncAvailability();
    },
    [flushPending, syncAvailability],
  );

  // Thực thi một command bất kỳ (thao tác thiết kế, cấu trúc, thêm/xóa/sắp xếp item)
  const executeCommand = useCallback(
    (command: CvCommand) => {
      flushPending();
      command.execute();
      pushUndo(command);
    },
    [flushPending, pushUndo],
  );

  // Undo: Chốt pending trước, sau đó lấy lệnh từ đỉnh undoStack
  const undo = useCallback(() => {
    flushPending();

    const history = historyRef.current;
    const command = history.undo.at(-1);
    if (!command) return;

    command.undo();
    historyRef.current = {
      undo: history.undo.slice(0, -1),
      redo: [...history.redo, command],
    };
    syncAvailability();
  }, [flushPending, syncAvailability]);

  // Redo: Chốt pending trước, sau đó lấy lệnh từ đỉnh redoStack
  const redo = useCallback(() => {
    flushPending();

    const history = historyRef.current;
    const command = history.redo.at(-1);
    if (!command) return;

    command.redo();
    historyRef.current = {
      undo: [...history.undo, command].slice(-MAX_HISTORY_LENGTH),
      redo: history.redo.slice(0, -1),
    };
    syncAvailability();
  }, [flushPending, syncAvailability]);

  // Xóa toàn bộ lịch sử khi lưu CV thành công
  const clearHistory = useCallback(() => {
    if (pendingRef.current?.timerId) {
      clearTimeout(pendingRef.current.timerId);
    }
    pendingRef.current = null;
    historyRef.current = { undo: [], redo: [] };
    syncAvailability();
  }, [syncAvailability]);

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (pendingRef.current?.timerId) {
        clearTimeout(pendingRef.current.timerId);
      }
    };
  }, []);

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
