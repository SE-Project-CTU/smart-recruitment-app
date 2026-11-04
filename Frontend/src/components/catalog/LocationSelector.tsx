import { AlertCircle, ChevronDown, MapPin } from "lucide-react";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import { useProvinces, useWards } from "@/hooks/queries/useCatalog";
import { cn } from "@/lib/utils";

export interface LocationSelectorProps {
  provinceId: string;
  wardId?: string;
  detailedLocation?: string;
  onChangeProvince: (provinceId: string) => void;
  onChangeWard: (wardId: string) => void;
  onChangeDetailedLocation?: (detailedLocation: string) => void;
  errors?: {
    provinceId?: string;
    wardId?: string;
    detailedLocation?: string;
  };
  disabled?: boolean;
  required?: boolean;
  showDetailedLocation?: boolean;
}

export function LocationSelector({
  provinceId,
  wardId = "",
  detailedLocation = "",
  onChangeProvince,
  onChangeWard,
  onChangeDetailedLocation,
  errors = {},
  disabled = false,
  required = true,
  showDetailedLocation = true,
}: LocationSelectorProps) {
  // Kéo danh sách 63 tỉnh/thành từ API backend
  const { data: provinces = [], isLoading: isLoadingProvinces } =
    useProvinces();

  // Kéo danh sách phường/xã theo tỉnh đã chọn
  const { data: wards = [], isFetching: isFetchingWards } = useWards(
    provinceId || undefined,
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Tỉnh / Thành phố */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-text-main">
            <MapPin className="size-3.5 text-primary" />
            <span>Tỉnh / Thành phố</span>
            {required && <span className="text-status-error">*</span>}
          </label>
          <div className="relative">
            <Select.Root
              items={provinces.map((p) => ({ value: p.id, label: p.name }))}
              value={provinceId || null}
              disabled={disabled || isLoadingProvinces}
              onValueChange={(val) => {
                if (val && val !== provinceId) {
                  onChangeProvince(val);
                  onChangeWard("");
                }
              }}
            >
              <Select.Trigger
                aria-label="Chọn Tỉnh / Thành phố"
                className={cn(
                  "group flex w-full cursor-pointer items-center justify-between rounded-xl border bg-surface px-3 py-2.5 text-xs font-medium text-text-main transition-colors outline-none focus:ring-1",
                  errors.provinceId
                    ? "border-rose-400 focus:border-status-error focus:ring-status-error/20"
                    : "border-border focus:border-primary focus:ring-primary/20",
                  (disabled || isLoadingProvinces) &&
                    "cursor-not-allowed opacity-60",
                )}
              >
                <Select.Value
                  placeholder={
                    isLoadingProvinces
                      ? "Đang tải tỉnh/thành..."
                      : "Chọn tỉnh thành"
                  }
                >
                  {(val) =>
                    provinces.find((p) => p.id === val)?.name ||
                    (isLoadingProvinces
                      ? "Đang tải tỉnh/thành..."
                      : "Chọn tỉnh thành")
                  }
                </Select.Value>
                <Select.Icon className="text-text-muted transition-transform duration-200 group-data-popup-open:rotate-180">
                  <ChevronDown className="size-3.5" />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Positioner
                  alignItemWithTrigger={false}
                  sideOffset={4}
                  className="isolate z-50"
                >
                  <Select.Popup className="max-h-64 w-(--anchor-width) min-w-48 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-md">
                    <Select.List>
                      {provinces.map((prov) => (
                        <Select.Item
                          key={prov.id}
                          value={prov.id}
                          className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-text-main transition-colors hover:bg-bg data-highlighted:bg-bg data-[state=checked]:font-semibold data-[state=checked]:text-primary"
                        >
                          <Select.ItemText>{prov.name}</Select.ItemText>
                          <Select.ItemIndicator
                            animation="pop"
                            className="ml-2 text-xs text-primary"
                          >
                            ✓
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </div>
          <div className="mt-1 min-h-5 text-[11px] leading-tight text-status-error">
            {errors.provinceId && (
              <span className="animate-in fade-in flex items-center gap-1 duration-150">
                <AlertCircle className="size-3 shrink-0" />
                <span>{errors.provinceId}</span>
              </span>
            )}
          </div>
        </div>

        {/* Phường / Xã */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-text-main">
            <span>Phường / Xã</span>
          </label>
          <div className="relative">
            <Select.Root
              items={wards.map((w) => ({ value: w.id, label: w.name }))}
              value={wardId || null}
              disabled={disabled || !provinceId || isFetchingWards}
              onValueChange={(val) => {
                if (val) onChangeWard(val);
              }}
            >
              <Select.Trigger
                aria-label="Chọn Phường / Xã"
                className={cn(
                  "group flex w-full cursor-pointer items-center justify-between rounded-xl border bg-surface px-3 py-2.5 text-xs font-medium text-text-main transition-colors outline-none focus:ring-1",
                  errors.wardId
                    ? "border-rose-400 focus:border-status-error focus:ring-status-error/20"
                    : "border-border focus:border-primary focus:ring-primary/20",
                  (!provinceId || disabled || isFetchingWards) &&
                    "cursor-not-allowed opacity-60",
                )}
              >
                <Select.Value
                  placeholder={
                    !provinceId
                      ? "--Chưa chọn tỉnh--"
                      : isFetchingWards
                        ? "Đang tải phường/xã..."
                        : "Chọn phường/xã"
                  }
                >
                  {(val) =>
                    wards.find((w) => w.id === val)?.name ||
                    (!provinceId
                      ? "--Chưa chọn tỉnh--"
                      : isFetchingWards
                        ? "Đang tải phường/xã..."
                        : "Chọn phường/xã")
                  }
                </Select.Value>
                <Select.Icon className="text-text-muted transition-transform duration-200 group-data-popup-open:rotate-180">
                  <ChevronDown className="size-3.5" />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Positioner
                  alignItemWithTrigger={false}
                  sideOffset={4}
                  className="isolate z-50"
                >
                  <Select.Popup className="max-h-64 w-(--anchor-width) min-w-48 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-md">
                    <Select.List>
                      {wards.map((ward) => (
                        <Select.Item
                          key={ward.id}
                          value={ward.id}
                          className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-text-main transition-colors hover:bg-bg data-highlighted:bg-bg data-[state=checked]:font-semibold data-[state=checked]:text-primary"
                        >
                          <Select.ItemText>{ward.name}</Select.ItemText>
                          <Select.ItemIndicator
                            animation="pop"
                            className="ml-2 text-xs text-primary"
                          >
                            ✓
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </div>
          <div className="mt-1 min-h-5 text-[11px] leading-tight text-status-error">
            {errors.wardId && (
              <span className="animate-in fade-in flex items-center gap-1 duration-150">
                <AlertCircle className="size-3 shrink-0" />
                <span>{errors.wardId}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Địa chỉ chi tiết */}
      {showDetailedLocation && onChangeDetailedLocation && (
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-text-main">
            <span>Địa chỉ cụ thể (Tòa nhà, số nhà, ngõ/đường)</span>
          </label>
          <input
            type="text"
            value={detailedLocation}
            disabled={disabled}
            onChange={(e) => onChangeDetailedLocation(e.target.value)}
            placeholder="Ví dụ: Tầng 12, Tòa nhà Landmark 81, số 720A Điện Biên Phủ"
            className={cn(
              "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-xs text-text-main transition-colors outline-none focus:ring-1",
              errors.detailedLocation
                ? "border-rose-400 focus:border-status-error focus:ring-status-error/20"
                : "border-border focus:border-primary focus:ring-primary/20",
              disabled && "cursor-not-allowed opacity-60",
            )}
          />
          <div className="mt-1 min-h-5 text-[11px] leading-tight text-status-error">
            {errors.detailedLocation && (
              <span className="animate-in fade-in flex items-center gap-1 duration-150">
                <AlertCircle className="size-3 shrink-0" />
                <span>{errors.detailedLocation}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationSelector;
