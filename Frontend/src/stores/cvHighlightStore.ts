import { create } from "zustand";

interface CvHighlightState {
  highlightSectionKey: string | null;
  setHighlightSectionKey: (key: string | null) => void;
  clearHighlight: () => void;
}

/**
 * useCvHighlightStore:
 * Zustand store quản lý trạng thái highlight section trên CV khi người dùng
 * tương tác với các tính năng trợ lý AI (CV Assistant / Rewrite Suggestion).
 * Không phụ thuộc vào React Context Provider, có thể dùng an toàn ở mọi nơi (kể cả chế độ Preview/Read-only).
 */
export const useCvHighlightStore = create<CvHighlightState>((set) => ({
  highlightSectionKey: null,
  setHighlightSectionKey: (key) =>
    set({ highlightSectionKey: key ? key.toLowerCase() : null }),
  clearHighlight: () => set({ highlightSectionKey: null }),
}));
