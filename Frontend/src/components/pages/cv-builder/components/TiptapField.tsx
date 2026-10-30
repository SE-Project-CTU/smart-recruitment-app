import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useController, useFormContext, type FieldPath } from "react-hook-form";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
} from "lucide-react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { CvTiptapDocument } from "@/types/cv";
import type { RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";
import { cvTiptapExtensions } from "@/features/cv-builder/editor/cvTiptapExtensions";
import { CV_FONT_OPTIONS } from "@/features/cv-builder/constants/fonts";
import {
  createEmptyTiptapDocument,
  sanitizeTiptapDocument,
} from "@/features/cv-builder/utils/tiptapJson";

interface TiptapFieldProps {
  name: FieldPath<RichTextCvEditorValues>;
  placeholder?: string;
  isReadOnly?: boolean;
  className?: string;
  multiline?: boolean;
}

const FONT_SIZE_OPTIONS = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28];

function FieldToolbar({
  editor,
  toolbarRef,
  position,
}: {
  editor: NonNullable<ReturnType<typeof useEditor>>;
  toolbarRef: React.RefObject<HTMLDivElement | null>;
  position: { top: number; left: number };
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => {
      const rawFont =
        (current.getAttributes("textStyle").fontFamily as string) || "";
      const normalizedFont = rawFont.replace(/['"]/g, "").trim().toLowerCase();
      const rawSize =
        (current.getAttributes("textStyle").fontSize as string) || "";
      const normalizedSize = rawSize.replace(/[^0-9.]/g, "");
      return {
        bold: current.isActive("bold"),
        italic: current.isActive("italic"),
        underline: current.isActive("underline"),
        bulletList: current.isActive("bulletList"),
        orderedList: current.isActive("orderedList"),
        fontFamily: normalizedFont,
        fontSize: normalizedSize,
      };
    },
  });

  const actionClass = (isActive = false) =>
    cn(
      "rounded p-1.5 text-slate-700 hover:bg-slate-100",
      isActive && "bg-blue-100 text-blue-700",
    );

  const align = (textAlign: "left" | "center" | "right" | "justify") =>
    editor.chain().focus().updateAttributes("paragraph", { textAlign }).run();

  const setListStyle = (listStyle: "disc" | "decimal") => {
    const listNode = listStyle === "disc" ? "bulletList" : "orderedList";
    const chain = editor.chain().focus();
    if (listStyle === "disc") {
      chain
        .toggleBulletList()
        .updateAttributes(listNode, { listStyleType: listStyle })
        .run();
    } else {
      chain
        .toggleOrderedList()
        .updateAttributes(listNode, { listStyleType: listStyle })
        .run();
    }
  };

  return (
    <div
      ref={toolbarRef}
      className="no-print fixed z-[100] flex w-max max-w-[calc(100vw-1rem)] flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
      style={{ top: position.top, left: position.left }}
      role="toolbar"
      aria-label="Định dạng field CV"
      onMouseDown={(event) => {
        if ((event.target as HTMLElement).closest("button")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="button"
        className={actionClass(active?.bold)}
        title="In đậm"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={actionClass(active?.italic)}
        title="In nghiêng"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={actionClass(active?.underline)}
        title="Gạch chân"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </button>

      <span className="mx-0.5 h-5 w-px bg-slate-200" />
      <input
        aria-label="Màu chữ"
        title="Màu chữ"
        type="color"
        className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent p-0.5"
        onChange={(event) =>
          editor.chain().focus().setColor(event.target.value).run()
        }
      />
      <select
        aria-label="Font chữ"
        title="Font chữ"
        className="h-7 max-w-28 rounded border border-slate-200 bg-white px-1 text-xs"
        value={active?.fontFamily || ""}
        onChange={(event) => {
          const selectedFont = event.target.value;
          if (selectedFont) {
            editor.chain().focus().setFontFamily(selectedFont).run();
          } else {
            editor.chain().focus().unsetFontFamily().run();
          }
        }}
      >
        <option value="">Mặc định</option>
        {CV_FONT_OPTIONS.map((font) => (
          <option key={font.id} value={font.id}>
            {font.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Cỡ chữ"
        title="Cỡ chữ"
        className="h-7 w-16 rounded border border-slate-200 bg-white px-1 text-xs"
        value={active?.fontSize || ""}
        onChange={(event) => {
          const selectedSize = event.target.value;
          if (selectedSize) {
            editor.chain().focus().setFontSize(`${selectedSize}px`).run();
          } else {
            editor.chain().focus().unsetFontSize().run();
          }
        }}
      >
        <option value="">Cỡ</option>
        {FONT_SIZE_OPTIONS.map((size) => (
          <option key={size} value={String(size)}>
            {size}px
          </option>
        ))}
      </select>
      <span className="mx-0.5 h-5 w-px bg-slate-200" />
      <button
        type="button"
        className={actionClass()}
        title="Căn trái"
        onClick={() => align("left")}
      >
        <AlignLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={actionClass()}
        title="Căn giữa"
        onClick={() => align("center")}
      >
        <AlignCenter className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={actionClass()}
        title="Căn phải"
        onClick={() => align("right")}
      >
        <AlignRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={actionClass()}
        title="Căn đều"
        onClick={() => align("justify")}
      >
        <AlignJustify className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={actionClass(active?.bulletList)}
        title="Danh sách dấu chấm"
        aria-label="Danh sách dấu chấm"
        onClick={() => setListStyle("disc")}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={actionClass(active?.orderedList)}
        title="Danh sách đánh số"
        aria-label="Danh sách đánh số"
        onClick={() => setListStyle("decimal")}
      >
        <ListOrdered className="h-4 w-4" />
      </button>
    </div>
  );
}

export const TiptapField: React.FC<TiptapFieldProps> = ({
  name,
  placeholder = "",
  isReadOnly = false,
  className,
  multiline = false,
}) => {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const { field } = useController({ name, control });
  const fieldRef = useRef(field);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 8, left: 8 });

  useEffect(() => {
    fieldRef.current = field;
  }, [field]);

  const value = (field.value ??
    createEmptyTiptapDocument()) as CvTiptapDocument;
  const editor = useEditor(
    {
      extensions: cvTiptapExtensions,
      content: value,
      editable: !isReadOnly,
      onUpdate: ({ editor: currentEditor }) => {
        fieldRef.current.onChange(
          sanitizeTiptapDocument(currentEditor.getJSON() as CvTiptapDocument),
        );
      },
      onFocus: () => setIsFocused(true),
      onBlur: () => {
        fieldRef.current.onBlur();
        window.setTimeout(() => {
          const activeElement = document.activeElement;
          if (
            !wrapperRef.current?.contains(activeElement) &&
            !toolbarRef.current?.contains(activeElement)
          )
            setIsFocused(false);
        }, 0);
      },
      editorProps: {
        attributes: {
          class: cn(
            "cv-tiptap-content min-h-[1em] w-full outline-none",
            !isReadOnly && "hover-field cursor-text",
            multiline && "min-h-5",
          ),
          "aria-label": placeholder,
          "data-placeholder": placeholder,
        },
        handleClick: (_view, _position, event) => {
          if (isReadOnly) return false;

          const anchor = (event.target as HTMLElement).closest("a");
          if (!anchor) return false;

          event.preventDefault();
          return true;
        },
      },
    },
    [name],
  );

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const shouldBeEditable = !isReadOnly;
    if (editor.isEditable !== shouldBeEditable) {
      editor.setEditable(shouldBeEditable, false);
      editor.setOptions({
        editorProps: {
          attributes: {
            class: cn(
              "cv-tiptap-content min-h-[1em] w-full outline-none",
              shouldBeEditable && "hover-field cursor-text",
              multiline && "min-h-5",
            ),
            "aria-label": placeholder,
            "data-placeholder": placeholder,
          },
          handleClick: (_view, _position, event) => {
            if (!shouldBeEditable) return false;

            const anchor = (event.target as HTMLElement).closest("a");
            if (!anchor) return false;

            event.preventDefault();
            return true;
          },
        },
      });
    }
  }, [editor, isReadOnly, placeholder, multiline]);

  useEffect(() => {
    if (!editor || editor.isDestroyed || editor.isFocused) return;
    const editorJson = JSON.stringify(
      sanitizeTiptapDocument(editor.getJSON() as CvTiptapDocument),
    );
    const fieldJson = JSON.stringify(sanitizeTiptapDocument(value));
    if (editorJson !== fieldJson) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useLayoutEffect(() => {
    if (!editor || !isFocused || isReadOnly) return;

    const updatePosition = () => {
      const anchor = wrapperRef.current?.getBoundingClientRect();
      const toolbar = toolbarRef.current?.getBoundingClientRect();
      if (!anchor || !toolbar) return;

      const margin = 8;
      const gap = 6;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const placeAbove =
        anchor.top - margin >= toolbar.height + gap ||
        anchor.top >= viewportHeight - anchor.bottom;
      const preferredTop = placeAbove
        ? anchor.top - toolbar.height - gap
        : anchor.bottom + gap;
      const left = Math.min(
        Math.max(margin, anchor.left),
        Math.max(margin, viewportWidth - toolbar.width - margin),
      );
      const top = Math.min(
        Math.max(margin, preferredTop),
        Math.max(margin, viewportHeight - toolbar.height - margin),
      );

      setToolbarPosition((current) =>
        current.top === top && current.left === left ? current : { top, left },
      );
    };

    const frameId = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    const resizeObserver = new ResizeObserver(updatePosition);
    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);
    if (toolbarRef.current) resizeObserver.observe(toolbarRef.current);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      resizeObserver.disconnect();
    };
  }, [editor, isFocused, isReadOnly]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "cv-rich-text-field relative flex flex-col",
        isFocused && !isReadOnly && "z-30",
        className,
      )}
    >
      {isFocused &&
        !isReadOnly &&
        editor &&
        typeof document !== "undefined" &&
        createPortal(
          <FieldToolbar
            editor={editor}
            toolbarRef={toolbarRef}
            position={toolbarPosition}
          />,
          document.body,
        )}
      <EditorContent
        editor={editor}
        spellCheck={false}
        onClick={() => editor?.commands.focus()}
      />
    </div>
  );
};
