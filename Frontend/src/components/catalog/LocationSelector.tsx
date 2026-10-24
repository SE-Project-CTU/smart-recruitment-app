import React from "react";
import { AlertCircle, MapPin } from "lucide-react";
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

  const handleProvinceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextProvinceId = e.target.value;
    onChangeProvince(nextProvinceId);
    onChangeWard(""); // Luôn reset phường/xã khi đổi tỉnh/thành
  };

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
            <select
              value={provinceId}
              disabled={disabled || isLoadingProvinces}
              onChange={handleProvinceSelect}
              className={cn(
                "w-full appearance-none rounded-xl border bg-surface px-3 py-2.5 text-xs font-medium text-text-main transition-colors outline-none focus:ring-1",
                errors.provinceId
                  ? "border-rose-400 focus:border-status-error focus:ring-status-error/20"
                  : "border-border focus:border-primary focus:ring-primary/20",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <option value="">
                {isLoadingProvinces
                  ? "Đang tải tỉnh/thành..."
                  : "-- Chọn Tỉnh / Thành phố --"}
              </option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
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
            <select
              value={wardId}
              disabled={disabled || !provinceId || isFetchingWards}
              onChange={(e) => onChangeWard(e.target.value)}
              className={cn(
                "w-full appearance-none rounded-xl border bg-surface px-3 py-2.5 text-xs font-medium text-text-main transition-colors outline-none focus:ring-1",
                errors.wardId
                  ? "border-rose-400 focus:border-status-error focus:ring-status-error/20"
                  : "border-border focus:border-primary focus:ring-primary/20",
                (!provinceId || disabled) && "cursor-not-allowed opacity-60",
              )}
            >
              <option value="">
                {!provinceId
                  ? "-- Vui lòng chọn Tỉnh/Thành trước --"
                  : isFetchingWards
                    ? "Đang tải phường/xã..."
                    : "-- Chọn Phường / Xã --"}
              </option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name}
                </option>
              ))}
            </select>
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
