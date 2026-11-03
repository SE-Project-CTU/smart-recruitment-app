import { useMemo, useRef, useState, useEffect } from "react";
import { Check, ChevronDown, MapPin, Search, X } from "lucide-react";
import { useProvinces, useWards } from "@/hooks/queries/useCatalog";
import type { ProvinceItem, WardItem } from "@/types/catalog";

export interface SelectedLocation {
  province: string | null;
  ward: string | null;
  provinceId?: string | null;
  wardId?: string | null;
}

export interface LocationGroup {
  province: string;
  wards: string[];
  provinceId?: string;
}

interface LocationComboboxProps {
  value: SelectedLocation;
  onChange: (next: SelectedLocation) => void;
  groups?: LocationGroup[];
  className?: string;
  buttonClassName?: string;
  useCatalogApi?: boolean;
}

export function LocationCombobox({
  value,
  onChange,
  groups,
  className = "min-w-52",
  buttonClassName,
  useCatalogApi = true,
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Lấy dữ liệu 63 tỉnh/thành phố thật từ backend API
  const { data: realProvinces = [], isLoading: isLoadingProvinces } =
    useProvinces();

  // Danh sách tỉnh hiển thị: Ưu tiên dữ liệu từ Catalog API, hỗ trợ fallback groups nếu có
  const provinceList = useMemo<ProvinceItem[]>(() => {
    if (useCatalogApi && realProvinces.length > 0) {
      return realProvinces;
    }
    if (groups && groups.length > 0) {
      return groups.map((g, idx) => ({
        id: g.provinceId || `loc-${idx}`,
        name: g.province,
        status: "Active",
        isCentrallyGoverned: false,
      }));
    }
    return realProvinces;
  }, [useCatalogApi, realProvinces, groups]);

  // Tỉnh hiện đang được mở rộng xem danh sách phường/xã
  const selectedProvinceId = useMemo(() => {
    if (value.provinceId) return value.provinceId;
    if (!value.province) return null;
    return provinceList.find((p) => p.name === value.province)?.id ?? null;
  }, [value.provinceId, value.province, provinceList]);
  const valueKey = value.provinceId ?? value.province ?? "";
  const [expansionOverride, setExpansionOverride] = useState<{
    valueKey: string;
    provinceId: string | null;
  } | null>(null);
  const expandedProvinceId =
    expansionOverride?.valueKey === valueKey
      ? expansionOverride.provinceId
      : selectedProvinceId;

  // Lấy danh sách phường/xã thật của tỉnh đang được mở rộng
  const { data: realWards = [], isFetching: isFetchingWards } = useWards(
    expandedProvinceId || undefined,
  );

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

  // Lọc danh sách tỉnh/thành theo từ khóa tìm kiếm
  const filteredProvinces = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return provinceList;
    return provinceList.filter((p) => p.name.toLowerCase().includes(q));
  }, [provinceList, query]);

  const displayLabel = useMemo(() => {
    if (!value.province) return "Tất cả địa điểm";
    if (value.ward) return `${value.ward}, ${value.province}`;
    return value.province;
  }, [value]);

  const handleSelect = (
    province: string | null,
    ward: string | null,
    provinceId?: string | null,
    wardId?: string | null,
  ) => {
    onChange({
      province,
      ward,
      provinceId: provinceId ?? null,
      wardId: wardId ?? null,
    });
    setOpen(false);
    setQuery("");
  };

  const toggleExpandProvince = (provinceId: string) => {
    setExpansionOverride({
      valueKey,
      provinceId: expandedProvinceId === provinceId ? null : provinceId,
    });
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
                handleSelect(null, null, null, null);
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
              onClick={() => handleSelect(null, null, null, null)}
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors hover:bg-bg ${
                !value.province
                  ? "font-medium text-primary"
                  : "font-medium text-text-main"
              }`}
            >
              <span>Tất cả địa điểm</span>
              {!value.province && <Check className="size-3.5 text-primary" />}
            </button>

            {isLoadingProvinces ? (
              <p className="py-4 text-center text-xs text-text-muted">
                Đang tải danh sách địa điểm...
              </p>
            ) : filteredProvinces.length === 0 ? (
              <p className="py-4 text-center text-xs text-text-muted">
                Không tìm thấy khu vực phù hợp
              </p>
            ) : (
              filteredProvinces.map((prov: ProvinceItem) => {
                const isProvinceSelected =
                  (value.provinceId === prov.id ||
                    value.province === prov.name) &&
                  !value.ward;
                const isExpanded = expandedProvinceId === prov.id;

                return (
                  <div key={prov.id} className="mt-1 flex flex-col">
                    <div className="flex items-center justify-between rounded-xl hover:bg-bg">
                      <button
                        type="button"
                        onClick={() => {
                          handleSelect(prov.name, null, prov.id, null);
                        }}
                        className={`flex flex-1 cursor-pointer items-center justify-between px-2.5 py-1.5 text-left text-xs transition-colors ${
                          isProvinceSelected
                            ? "bg-primary/5 font-medium text-primary"
                            : "font-medium text-text-main"
                        }`}
                      >
                        <span>{prov.name}</span>
                        {isProvinceSelected && (
                          <Check className="size-3.5 text-primary" />
                        )}
                      </button>

                      <button
                        type="button"
                        aria-label={`Mở rộng danh sách xã của ${prov.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandProvince(prov.id);
                        }}
                        className="cursor-pointer p-1.5 text-text-muted hover:text-primary"
                      >
                        <ChevronDown
                          className={`size-3 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="ml-3 flex flex-col border-l border-border pl-2">
                        {isFetchingWards ? (
                          <span className="px-2.5 py-1.5 text-[11px] text-text-muted">
                            Đang tải phường/xã...
                          </span>
                        ) : realWards.length === 0 ? (
                          <span className="px-2.5 py-1.5 text-[11px] text-text-muted">
                            Không có dữ liệu phường/xã
                          </span>
                        ) : (
                          realWards.map((ward: WardItem) => {
                            const isWardSelected =
                              (value.wardId === ward.id ||
                                value.ward === ward.name) &&
                              (value.provinceId === prov.id ||
                                value.province === prov.name);

                            return (
                              <button
                                key={ward.id}
                                type="button"
                                onClick={() =>
                                  handleSelect(
                                    prov.name,
                                    ward.name,
                                    prov.id,
                                    ward.id,
                                  )
                                }
                                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-bg ${
                                  isWardSelected
                                    ? "font-semibold text-primary"
                                    : "text-text-muted hover:text-text-main"
                                }`}
                              >
                                <span className="truncate">{ward.name}</span>
                                {isWardSelected && (
                                  <Check className="size-3.5 shrink-0 text-primary" />
                                )}
                              </button>
                            );
                          })
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
    </div>
  );
}
