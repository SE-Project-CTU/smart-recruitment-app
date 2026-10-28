import { useMemo, useRef, useState, useEffect } from "react";
import { Check, ChevronDown, MapPin, Search, X } from "lucide-react";
import {
  MOCK_LOCATION_HIERARCHY,
  type LocationGroup,
} from "@/constants/mockData";

export interface SelectedLocation {
  province: string | null;
  ward: string | null;
}

interface LocationComboboxProps {
  value: SelectedLocation;
  onChange: (next: SelectedLocation) => void;
  groups?: LocationGroup[];
  className?: string;
  buttonClassName?: string;
}

export function LocationCombobox({
  value,
  onChange,
  groups = MOCK_LOCATION_HIERARCHY,
  className = "min-w-52",
  buttonClassName,
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;

    return groups
      .map((g) => {
        const matchProvince = g.province.toLowerCase().includes(q);
        const matchedWards = g.wards.filter((w) => w.toLowerCase().includes(q));
        if (matchProvince) return g;
        if (matchedWards.length > 0) {
          return { province: g.province, wards: matchedWards };
        }
        return null;
      })
      .filter((g): g is LocationGroup => g !== null);
  }, [groups, query]);

  const displayLabel = useMemo(() => {
    if (!value.province) return "Tất cả địa điểm";
    if (value.ward) return `${value.ward}, ${value.province}`;
    return value.province;
  }, [value]);

  const handleSelect = (province: string | null, ward: string | null) => {
    onChange({ province, ward });
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={
          buttonClassName ||
          "flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs font-semibold text-text-main transition-colors hover:border-primary focus:border-primary focus:bg-surface focus:outline-none"
        }
      >
        <span className="flex items-center gap-2 truncate">
          <MapPin className="size-4 shrink-0 text-primary" />
          <span className="truncate">{displayLabel}</span>
        </span>

        <span className="flex items-center gap-1">
          {value.province && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(null, null);
              }}
              className="rounded-full p-0.5 text-text-muted hover:bg-border hover:text-text-main"
            >
              <X className="size-3" />
            </span>
          )}
          <ChevronDown
            className={`size-3.5 text-text-muted transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 left-0 z-50 mt-1.5 flex max-h-80 w-full min-w-64 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
          <div className="flex items-center border-b border-border px-3 py-2">
            <Search className="mr-2 size-3.5 shrink-0 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tỉnh thành, quận/phường..."
              className="w-full bg-transparent text-xs text-text-main placeholder:text-text-muted focus:outline-none"
              autoFocus
            />
          </div>

          <div className="flex-1 overflow-y-auto p-1.5">
            <button
              type="button"
              onClick={() => handleSelect(null, null)}
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors hover:bg-bg ${
                !value.province
                  ? "font-bold text-primary"
                  : "font-medium text-text-main"
              }`}
            >
              <span>Tất cả địa điểm</span>
              {!value.province && <Check className="size-3.5 text-primary" />}
            </button>

            {filteredGroups.length === 0 ? (
              <p className="py-4 text-center text-xs text-text-muted">
                Không tìm thấy khu vực phù hợp
              </p>
            ) : (
              filteredGroups.map((group) => {
                const isProvinceSelected =
                  value.province === group.province && !value.ward;

                return (
                  <div key={group.province} className="mt-1 flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleSelect(group.province, null)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-bg ${
                        isProvinceSelected
                          ? "bg-primary/5 font-bold text-primary"
                          : "font-bold text-text-main"
                      }`}
                    >
                      <span>{group.province} (Tất cả)</span>
                      {isProvinceSelected && (
                        <Check className="size-3.5 text-primary" />
                      )}
                    </button>

                    <div className="ml-3 flex flex-col border-l border-border pl-2">
                      {group.wards.map((ward) => {
                        const isWardSelected =
                          value.province === group.province &&
                          value.ward === ward;

                        return (
                          <button
                            key={ward}
                            type="button"
                            onClick={() => handleSelect(group.province, ward)}
                            className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-bg ${
                              isWardSelected
                                ? "font-semibold text-primary"
                                : "text-text-muted hover:text-text-main"
                            }`}
                          >
                            <span className="truncate">{ward}</span>
                            {isWardSelected && (
                              <Check className="size-3.5 shrink-0 text-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
