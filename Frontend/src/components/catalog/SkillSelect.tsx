import { useState, useRef, useEffect } from "react";
import { AlertCircle, Check, ChevronDown, Search, X } from "lucide-react";
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

  // Lưu trữ tên skill được chọn để tag không phụ thuộc vào kết quả tìm kiếm hiện tại
  const [skillCache, setSkillCache] = useState<Map<string, string>>(new Map());

  // Click outside listener để đóng dropdown
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

  const clearAllSelected = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange([]);
  };

  return (
    <div ref={containerRef} className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-main">
            <span>{label}</span>
            {required && <span className="text-status-error">*</span>}
          </label>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && !disabled && (
              <button
                type="button"
                onClick={clearAllSelected}
                className="text-[11px] text-text-muted transition-colors hover:text-status-error"
              >
                Xóa tất cả
              </button>
            )}
            <span className="text-[11px] text-text-muted">
              Đã chọn:{" "}
              <strong className="font-semibold text-primary">
                {selectedIds.length}
              </strong>
              /{maxItems}
            </span>
          </div>
        </div>
      )}

      {/* Box kích hoạt dropdown & hiển thị tag đã chọn */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          "flex min-h-11 w-full cursor-pointer items-center justify-between rounded-xl border bg-surface p-2 text-xs transition-colors",
          error
            ? "border-rose-400"
            : isOpen
              ? "border-primary ring-1 ring-primary/20"
              : "border-border hover:border-slate-300",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <div className="flex w-full flex-wrap items-center justify-between gap-1.5">
          {selectedIds.length === 0 ? (
            <span className="px-1 text-text-muted select-none">
              {isFetching && skills.length === 0
                ? "Đang tải danh sách kỹ năng từ hệ thống..."
                : "Chọn kỹ năng"}
            </span>
          ) : (
            selectedIds.map((id) => {
              const skillName = skillCache.get(id) || id;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary-light px-2 py-1 text-[11px] font-medium text-primary capitalize select-none"
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
            })
          )}
          <span className="ml-auto flex items-center pr-1 text-text-muted">
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          </span>
        </div>
      </div>

      {/* Dropdown panel gợi ý & tìm kiếm kỹ năng */}
      {isOpen && (
        <div className="animate-in fade-in-50 slide-in-from-top-1 z-50 mt-1 max-h-80 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {/* Ô tìm kiếm */}
          <div className="border-b border-border p-2">
            <div className="flex items-center gap-2 rounded-xl bg-bg px-2.5 py-1.5">
              <Search className="size-3.5 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm kỹ năng chuyên môn..."
                className="w-full bg-transparent text-xs text-text-main outline-none placeholder:text-text-muted"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-text-muted hover:text-text-main"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Danh sách kỹ năng */}
          <div className="max-h-64 space-y-2 overflow-y-auto p-2">
            {isFetching && skills.length === 0 ? (
              <p className="py-6 text-center text-xs text-text-muted">
                Đang tìm kiếm kỹ năng trong hệ thống...
              </p>
            ) : skills.length === 0 ? (
              <p className="py-6 text-center text-xs text-text-muted">
                Không tìm thấy kỹ năng nào khớp với &quot;{searchQuery}&quot;.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 p-1">
                {skills.map((skill) => {
                  const isSelected = selectedIds.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs capitalize transition-all select-none",
                        isSelected
                          ? "bg-secondary-light font-medium shadow-xs"
                          : "border-border bg-bg font-normal text-text-main hover:border-border hover:bg-surface",
                      )}
                    >
                      {isSelected && <Check className="size-3 shrink-0" />}
                      <span>{skill.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error container cố định chiều cao tránh giật layout */}
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
