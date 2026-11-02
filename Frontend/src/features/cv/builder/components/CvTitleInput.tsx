import React, { useState, useRef } from "react";
import { Edit3, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useUpdateCv } from "@/hooks/queries/useCv";
import { getApiErrorMessage } from "@/api/errorHandler";

interface CvTitleInputProps {
  cvId?: string;
  initialTitle: string;
  isLocked?: boolean;
  onTitleSaved?: (newTitle: string) => void;
}

export const CvTitleInput: React.FC<CvTitleInputProps> = ({
  cvId,
  initialTitle,
  isLocked = false,
  onTitleSaved,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [savedTitle, setSavedTitle] = useState(initialTitle);
  const [prevInitialTitle, setPrevInitialTitle] = useState(initialTitle);
  if (prevInitialTitle !== initialTitle) {
    setPrevInitialTitle(initialTitle);
    setTitle(initialTitle);
    setSavedTitle(initialTitle);
  }

  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: updateCv, isPending: isUpdating } = useUpdateCv();

  const handleSaveTitle = async () => {
    const trimmedTitle = title.trim();

    // Nếu không có cvId hoặc tiêu đề không thay đổi thì bỏ qua
    if (!cvId || trimmedTitle === savedTitle) {
      setTitle(savedTitle);
      return;
    }

    // Nếu để trống thì phục hồi lại tên cũ và cảnh báo
    if (!trimmedTitle) {
      setTitle(savedTitle);
      toast.add({
        type: "error",
        description: "Tiêu đề CV không được để trống.",
      });
      return;
    }

    try {
      await updateCv({
        id: cvId,
        payload: {
          title: trimmedTitle,
        },
      });

      setSavedTitle(trimmedTitle);
      setTitle(trimmedTitle);
      onTitleSaved?.(trimmedTitle);

      setIsSuccessFeedback(true);
      window.setTimeout(() => {
        setIsSuccessFeedback(false);
      }, 1500);

      toast.add({
        type: "success",
        description: "Đã cập nhật tiêu đề CV",
      });
    } catch (err) {
      console.error("[CvTitleInput] Lỗi đổi tên CV:", err);
      setTitle(savedTitle);
      toast.add({
        type: "error",
        description: getApiErrorMessage(err, "Không thể cập nhật tiêu đề CV."),
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur(); // Sẽ trigger onBlur -> handleSaveTitle
    } else if (e.key === "Escape") {
      e.preventDefault();
      setTitle(savedTitle);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="group relative flex items-center gap-1.5">
      <input
        ref={inputRef}
        type="text"
        value={title}
        disabled={isLocked || isUpdating}
        maxLength={150}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleSaveTitle}
        onKeyDown={handleKeyDown}
        title="Nhấp để đổi tên CV (nhấn Enter để lưu)"
        placeholder="Nhập tiêu đề CV..."
        className={cn(
          "h-8 w-max min-w-[280px] md:min-w-[420px] rounded-md px-2 text-base font-semibold text-text-main transition-all",
          "border border-transparent hover:border-border hover:bg-bg",
          "focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary focus:outline-none",
          (isLocked || isUpdating) &&
            "cursor-default bg-transparent hover:border-transparent hover:bg-transparent opacity-80",
        )}
      />

      <div className="flex items-center">
        {isUpdating ? (
          <span title="Đang lưu tiêu đề...">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </span>
        ) : isSuccessFeedback ? (
          <span title="Đã lưu tiêu đề">
            <Check className="h-4 w-4 text-status-success animate-in fade-in zoom-in-50 duration-200" />
          </span>
        ) : !isLocked ? (
          <Edit3 className="pointer-events-none h-3.5 w-3.5 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
        ) : null}
      </div>
    </div>
  );
};
