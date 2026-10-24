import { useState, useRef, useEffect } from "react";
import { AlertCircle, Check, Loader2, Search, Sparkles, X } from "lucide-react";
import { useSkills } from "@/hooks/queries/useCatalog";
import { cn } from "@/lib/utils";

export interface SkillSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
  label?: string;
  required?: boolean;
  maxItems?: number;
  disabled?: boolean;
}

export function SkillSelect({
  selectedIds,
  onChange,
  error,
  label = "Kỹ năng chuyên môn",
  required = true,
  maxItems = 15,
  disabled = false,
}: SkillSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Kéo danh sách kỹ năng từ DB theo search query
  const { data: skills = [], isFetching } = useSkills(searchQuery);

  // Lưu trữ map id -> name của các skill đã từng được fetch để hiển thị tag
  const [skillCache, setSkillCache] = useState<Map<string, string>>(new Map());

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSkill = (skillId: string) => {
    if (disabled) return;
    const selectedSkill = skills.find((skill) => skill.id === skillId);
    if (selectedSkill) {
      setSkillCache((current) => {
        const next = new Map(current);
        next.set(selectedSkill.id, selectedSkill.name);
        return next;
      });
    }
    if (selectedIds.includes(skillId)) {
      onChange(selectedIds.filter((id) => id !== skillId));
    } else {
      if (selectedIds.length >= maxItems) return;
      onChange([...selectedIds, skillId]);
    }
  };

  const removeSkill = (skillId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selectedIds.filter((id) => id !== skillId));
  };

  return (
    <div ref={containerRef} className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-main">
            <Sparkles className="size-3.5 text-primary" />
            <span>{label}</span>
            {required && <span className="text-status-error">*</span>}
          </label>
          <span className="text-[11px] text-text-muted">
            Đã chọn:{" "}
            <strong className="font-semibold">{selectedIds.length}</strong>/
            {maxItems}
          </span>
        </div>
      )}

      {/* Input tìm kiếm & hiển thị tags */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen(true);
        }}
        className={cn(
          "min-h-11 w-full rounded-xl border bg-surface p-2 text-xs transition-colors",
          error
            ? "border-rose-400"
            : isOpen
              ? "border-primary ring-1 ring-primary/20"
              : "border-border hover:border-slate-300",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Danh sách tag đã chọn */}
          {selectedIds.map((id) => {
            const skillName = skillCache.get(id) || id;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary capitalize select-none"
              >
                <span>{skillName}</span>
                <button
                  type="button"
                  onClick={(e) => removeSkill(id, e)}
                  className="rounded p-0.5 hover:bg-primary/20"
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}

          {/* Input text tìm kiếm */}
          <div className="flex min-w-32 flex-1 items-center gap-1 px-1">
            <Search className="size-3.5 shrink-0 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              disabled={disabled}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={
                selectedIds.length === 0
                  ? "Tìm kiếm và thêm kỹ năng (ví dụ: React, Java, Docker)..."
                  : "Thêm kỹ năng khác..."
              }
              className="w-full bg-transparent text-xs text-text-main outline-none placeholder:text-text-muted"
            />
            {isFetching && (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            )}
          </div>
        </div>
      </div>

      {/* Dropdown gợi ý kỹ năng */}
      {isOpen && (
        <div className="animate-in fade-in-50 slide-in-from-top-1 z-50 mt-1 max-h-56 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="max-h-56 overflow-y-auto p-2">
            {skills.length === 0 ? (
              <p className="py-4 text-center text-xs text-text-muted">
                {isFetching
                  ? "Đang tìm kỹ năng trong hệ thống..."
                  : "Không tìm thấy kỹ năng nào khớp với từ khóa."}
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => {
                  const isSelected = selectedIds.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={cn(
                        "cursor-poi nter inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs capitalize transition-colors select-none",
                        isSelected
                          ? "border-primary bg-primary font-medium text-white"
                          : "border-border bg-bg font-normal text-text-main hover:border-primary/40 hover:bg-surface",
                      )}
                    >
                      <span>{skill.name}</span>
                      {isSelected && <Check className="size-3 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error container cố định chiều cao */}
      <div className="min-h-5 text-[11px] leading-tight text-status-error">
        {error && (
          <span className="animate-in fade-in flex items-center gap-1 duration-150">
            <AlertCircle className="size-3 shrink-0" />
            <span>{error}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default SkillSelect;
