import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Palette,
  Plus,
  Redo,
  Type,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import type { Editor } from "@tiptap/react";

interface Presentation {
  themeColor: string;
  fontFamily: string;
}

interface CvBuilderEditorToolbarProps {
  isCompleted: boolean;
  activeEditor: Editor | null;
  presentation: Presentation;
  themeColors: { name: string; value: string; light: string }[];
  fontOptions: { name: string; value: string }[];
  onPresentationChange: (presentation: Presentation) => void;
  onAddSection: () => void;
}

export default function CvBuilderEditorToolbar({
  isCompleted,
  activeEditor,
  presentation,
  themeColors,
  fontOptions,
  onPresentationChange,
  onAddSection,
}: CvBuilderEditorToolbarProps) {
  if (isCompleted) return null;

  return (
    <div className="no-print sticky top-15.25 z-20 flex flex-wrap items-center justify-center gap-2 border-b border-border bg-bg/95 px-6 py-2 shadow-xs backdrop-blur-md">
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-2xs">
        <button
          type="button"
          onClick={() => activeEditor?.chain().focus().toggleBold().run()}
          disabled={!activeEditor}
          className={`rounded p-1.5 transition-colors hover:bg-secondary-light ${
            activeEditor?.isActive("bold")
              ? "bg-secondary text-primary"
              : "text-text-main"
          }`}
          title="In đậm (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => activeEditor?.chain().focus().toggleItalic().run()}
          disabled={!activeEditor}
          className={`rounded p-1.5 transition-colors hover:bg-secondary-light ${
            activeEditor?.isActive("italic")
              ? "bg-secondary text-primary"
              : "text-text-main"
          }`}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => activeEditor?.chain().focus().toggleUnderline().run()}
          disabled={!activeEditor}
          className={`rounded p-1.5 transition-colors hover:bg-secondary-light ${
            activeEditor?.isActive("underline")
              ? "bg-secondary text-primary"
              : "text-text-main"
          }`}
          title="Gạch chân (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        <button
          type="button"
          onClick={() => activeEditor?.chain().focus().toggleBulletList().run()}
          disabled={!activeEditor}
          className={`rounded p-1.5 transition-colors hover:bg-secondary-light ${
            activeEditor?.isActive("bulletList")
              ? "bg-secondary text-primary"
              : "text-text-main"
          }`}
          title="Danh sách dấu chấm"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            activeEditor?.chain().focus().toggleOrderedList().run()
          }
          disabled={!activeEditor}
          className={`rounded p-1.5 transition-colors hover:bg-secondary-light ${
            activeEditor?.isActive("orderedList")
              ? "bg-secondary text-primary"
              : "text-text-main"
          }`}
          title="Danh sách đánh số"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        <button
          type="button"
          onClick={() => activeEditor?.chain().focus().undo().run()}
          disabled={!activeEditor?.can().undo()}
          className="rounded p-1.5 text-text-main hover:bg-secondary-light disabled:opacity-40"
          title="Hoàn tác"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => activeEditor?.chain().focus().redo().run()}
          disabled={!activeEditor?.can().redo()}
          className="rounded p-1.5 text-text-main hover:bg-secondary-light disabled:opacity-40"
          title="Làm lại"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 shadow-2xs">
        <Type className="h-4 w-4 text-text-muted" />
        <select
          value={presentation.fontFamily}
          onChange={(e) =>
            onPresentationChange({
              ...presentation,
              fontFamily: e.target.value,
            })
          }
          className="bg-transparent text-xs font-medium text-text-main focus:outline-none"
        >
          {fontOptions.map((f) => (
            <option key={f.value} value={f.value}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 shadow-2xs">
        <Palette className="h-4 w-4 text-text-muted" />
        <span className="text-xs text-text-muted">Màu CV:</span>
        {themeColors.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() =>
              onPresentationChange({ ...presentation, themeColor: c.value })
            }
            className={`h-5 w-5 rounded-full transition-transform ${
              presentation.themeColor === c.value
                ? "scale-125 ring-2 ring-primary ring-offset-1"
                : "hover:scale-110"
            }`}
            style={{ backgroundColor: c.value }}
            title={c.name}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddSection}
        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-secondary-light px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-secondary"
      >
        <Plus className="h-4 w-4" />
        Thêm mục mới
      </button>
    </div>
  );
}
