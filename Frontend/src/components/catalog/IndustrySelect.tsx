import { useState, useMemo, useRef, useEffect } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useIndustryGroupsWithIndustries } from "@/hooks/queries/useCatalog";
import { cn } from "@/lib/utils";
import type { IndustryGroupWithIndustriesItem, IndustryItem } from "@/types";

export interface IndustrySelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
  label?: string;
  required?: boolean;
  maxItems?: number;
  disabled?: boolean;
}

export function IndustrySelect({
  selectedIds,
  onChange,
  error,
  label = "Ngành nghề tuyển dụng",
  required = true,
  maxItems = 10,
  disabled = false,
}: IndustrySelectProps) {
  const { data: industryGroups = [], isLoading } =
    useIndustryGroupsWithIndustries();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Mở rộng nhóm: lưu map groupId -> boolean
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Hàm lấy danh sách ngành nghề con từ group (Backend trả về items, dự phòng industries)
  const getGroupIndustries = (
    group: IndustryGroupWithIndustriesItem,
  ): IndustryItem[] => {
    return group.items || group.industries || [];
  };

  // Map phẳng toàn bộ ngành nghề để lấy tên hiển thị cho các tag đã chọn
  const industryMap = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; groupName: string }
    >();
    for (const group of industryGroups) {
      const children = getGroupIndustries(group);
      for (const ind of children) {
        map.set(ind.id, {
          id: ind.id,
          name: ind.name,
          groupName: group.name,
        });
      }
    }
    return map;
  }, [industryGroups]);

  // Lọc nhóm và ngành nghề theo từ khóa tìm kiếm
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return industryGroups.map((group) => ({
        ...group,
        matchedIndustries: getGroupIndustries(group),
      }));
    }

    return industryGroups
      .map((group) => {
        const groupMatch = group.name.toLowerCase().includes(q);
        const children = getGroupIndustries(group);
        const matchedChildren = children.filter((ind) =>
          ind.name.toLowerCase().includes(q),
        );

        if (groupMatch) {
          // Nếu tên nhóm khớp, hiển thị toàn bộ ngành con
          return { ...group, matchedIndustries: children };
        }

        if (matchedChildren.length > 0) {
          return { ...group, matchedIndustries: matchedChildren };
        }

        return null;
      })
      .filter(
        (
          g,
        ): g is IndustryGroupWithIndustriesItem & {
          matchedIndustries: IndustryItem[];
        } => g !== null,
      );
  }, [industryGroups, searchQuery]);

  const toggleGroupExpand = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    setExpandedGroups({});
  };

  const toggleIndustry = (id: string) => {
    if (disabled) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= maxItems) return;
      onChange([...selectedIds, id]);
    }
  };

  const removeIndustry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selectedIds.filter((item) => item !== id));
  };

  const clearAllSelected = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange([]);
  };

  return (
    <div ref={containerRef} className="space-y-1">
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
              {isLoading
                ? "Đang tải danh mục ngành nghề từ hệ thống..."
                : "Chọn nhóm ngành"}
            </span>
          ) : (
            selectedIds.map((id) => {
              const item = industryMap.get(id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary-light px-2 py-1 text-[11px] font-medium text-primary capitalize select-none"
                >
                  <span>{item ? item.name : id}</span>
                  <button
                    type="button"
                    onClick={(e) => removeIndustry(id, e)}
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

      {/* Dropdown panel dạng danh mục phân cấp */}
      {isOpen && (
        <div className="animate-in fade-in-50 slide-in-from-top-1 z-50 mt-1 max-h-80 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {/* Ô tìm kiếm */}
          <div className="border-b border-border p-2">
            <div className="flex items-center gap-2 rounded-xl bg-bg px-2.5 py-1.5">
              <Search className="size-3.5 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                placeholder="Tìm kiếm ngành nghề hoặc tên nhóm ngành..."
                className="w-full bg-transparent text-xs text-text-main outline-none placeholder:text-text-muted"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchQueryChange("")}
                  className="text-text-muted hover:text-text-main"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Danh sách các nhóm ngành kèm nhánh con */}
          <div className="max-h-64 space-y-2 overflow-y-auto p-2">
            {isLoading ? (
              <p className="py-6 text-center text-xs text-text-muted">
                Đang tải danh mục ngành nghề...
              </p>
            ) : filteredGroups.length === 0 ? (
              <p className="py-6 text-center text-xs text-text-muted">
                Không tìm thấy ngành nghề nào khớp với &quot;{searchQuery}
                &quot;.
              </p>
            ) : (
              filteredGroups.map((group) => {
                const industries = group.matchedIndustries || [];
                const isExpanded = expandedGroups[group.id] ?? true;
                const selectedCountInGroup = industries.filter((ind) =>
                  selectedIds.includes(ind.id),
                ).length;

                return (
                  <div
                    key={group.id}
                    className="overflow-hidden rounded-xl border border-border/80 bg-bg/50"
                  >
                    {/* Header Nhóm ngành */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => toggleGroupExpand(group.id, e)}
                      className="flex cursor-pointer items-center justify-between px-3 py-2 text-xs font-semibold text-text-main transition-colors select-none hover:bg-bg"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="size-3.5 text-text-muted" />
                        ) : (
                          <ChevronRight className="size-3.5 text-text-muted" />
                        )}
                        <span>{group.name}</span>
                        <span className="text-[11px] font-normal text-text-muted">
                          ({industries.length} ngành nghề)
                        </span>
                      </div>

                      {selectedCountInGroup > 0 && (
                        <span className="rounded-full bg-secondary-light px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Đã chọn {selectedCountInGroup}
                        </span>
                      )}
                    </div>

                    {/* Danh sách các ngành con bên trong nhóm */}
                    {isExpanded && (
                      <div className="border-t border-border/60 bg-surface p-2.5">
                        {industries.length === 0 ? (
                          <p className="py-1 text-center text-[11px] text-text-muted">
                            Chưa có ngành con trong nhóm này.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {industries.map((ind) => {
                              const isSelected = selectedIds.includes(ind.id);
                              return (
                                <button
                                  key={ind.id}
                                  type="button"
                                  onClick={() => toggleIndustry(ind.id)}
                                  className={cn(
                                    "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs capitalize transition-all select-none",
                                    isSelected
                                      ? "bg-secondary-light font-medium shadow-xs"
                                      : "border-border bg-bg font-normal text-text-main hover:border-border hover:bg-surface",
                                  )}
                                >
                                  {isSelected && (
                                    <Check className="size-3 shrink-0" />
                                  )}
                                  <span>{ind.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
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

export default IndustrySelect;
