import React from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "@/lib/utils";

export interface CvZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onZoomChange?: (value: number) => void;
  canZoomIn?: boolean;
  canZoomOut?: boolean;
  className?: string;
}

export const CvZoomControls: React.FC<CvZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onZoomChange,
  canZoomIn = true,
  canZoomOut = true,
  className,
}) => {
  const percentage = Math.round(zoom * 100);

  const handleSliderChange = (value: number | readonly number[]) => {
    const rawVal = Array.isArray(value) ? value[0] : value;
    if (typeof rawVal === "number" && onZoomChange) {
      onZoomChange(rawVal / 100);
    }
  };

  return (
    <div
      className={cn(
        "no-print absolute bottom-6 right-6 z-30 flex items-center gap-1.5 rounded-full border border-border bg-surface/95 px-3 py-1.5 shadow-lg backdrop-blur-md select-none transition-all",
        className,
      )}
    >
      {/* Nút bên trái: Thu nhỏ (-) */}
      <button
        type="button"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        aria-label="Thu nhỏ CV"
        className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>

      {/* Slider ở giữa */}
      <div className="w-24 sm:w-28 flex items-center px-1">
        <SliderPrimitive.Root
          value={percentage}
          onValueChange={handleSliderChange}
          min={50}
          max={150}
          step={5}
          className="w-full"
        >
          <SliderPrimitive.Control className="relative flex h-6 w-full touch-none items-center select-none cursor-pointer">
            <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200">
              <SliderPrimitive.Indicator className="h-full bg-primary" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="block size-3.5 shrink-0 rounded-full border-2 border-primary bg-white shadow-sm ring-primary/40 transition-[box-shadow] hover:ring-2 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
          </SliderPrimitive.Control>
        </SliderPrimitive.Root>
      </div>

      {/* Nút bên phải: Phóng to (+) */}
      <button
        type="button"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        aria-label="Phóng to CV"
        className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>

      {/* Hiển thị mức % - Bấm vào để khôi phục về 100% */}
      <button
        type="button"
        onClick={onResetZoom}
        title="Đặt lại về 100%"
        className="h-7 min-w-[2.75rem] px-1 text-center text-xs font-semibold text-text-main transition-colors hover:text-primary cursor-pointer rounded-sm hover:bg-bg shrink-0"
      >
        {percentage}%
      </button>
    </div>
  );
};
