import React, { useRef, useEffect } from "react";
import { useFormContext, useController, type FieldPath } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { CvEditorValues } from "@/features/cv-builder/schema/cvSchema";

interface EditableFieldProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: FieldPath<CvEditorValues>;
  placeholder?: string;
  isReadOnly?: boolean;
  className?: string;
  multiline?: boolean;
}

/**
 * EditableField:
 * Cho phép chỉnh sửa trực tiếp dạng WYSIWYG bằng contentEditable.
 * Đồng bộ hai chiều với React Hook Form mà không làm mất vị trí con trỏ khi gõ.
 */
export const EditableField: React.FC<EditableFieldProps> = ({
  name,
  placeholder = "",
  isReadOnly = false,
  className,
  multiline = false,
  style,
  ...props
}) => {
  const { control } = useFormContext<CvEditorValues>();
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
  });

  const ref = useRef<HTMLParagraphElement>(null);

  // Chỉ cập nhật innerText từ value khi component mount hoặc khi value từ bên ngoài thay đổi (e.g. undo/reset)
  useEffect(() => {
    if (ref.current && ref.current.innerText !== (value ?? "")) {
      ref.current.innerText = (value as string) ?? "";
    }
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    const text = e.currentTarget.innerText;
    onChange(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    // Nếu không multiline, nhấn Enter sẽ blur ra ngoài thay vì xuống dòng
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      ref.current?.blur();
    }
  };

  return (
    <p
      ref={ref}
      contentEditable={!isReadOnly}
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
      spellCheck={false}
      className={cn(
        "transition-colors outline-none",
        !isReadOnly && "hover-field cursor-text",
        // CSS placeholder khi rỗng
        "empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]",
        className,
      )}
      style={style}
      {...props}
    />
  );
};
