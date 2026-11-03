import React, { useRef, useEffect, useCallback, useState } from "react";
import { Check } from "lucide-react";
import {
  THEME_COLORS,
  isValidHexColor,
  hexToHsv,
  hsvToHex,
  type HSVColor,
} from "./designConstants";

interface InlineColorPaletteProps {
  color: string;
  onDragColor: (hex: string) => void;
  onCommitColor: (hex: string) => void;
}

/**
 * InlineColorPalette:
 * Bảng màu trực tiếp hiển thị inline ngay trên giao diện sidebar:
 * - Vùng chọn màu 2D: Độ bão hòa (Saturation) và Độ sáng (Value / Brightness).
 * - Thanh trượt dải màu (Hue slider) 360 độ.
 * - Danh sách màu mẫu có sẵn (Presets) chọn nhanh.
 * - Tối ưu 120 FPS: Trong lúc kéo chuột, dùng con trỏ DOM trực tiếp và gọi onDragColor
 *   (kết nối cvColorPreviewBridge) mà không kích hoạt React Hook Form hay re-render toàn cây DOM.
 */
export const InlineColorPalette: React.FC<InlineColorPaletteProps> = ({
  color,
  onDragColor,
  onCommitColor,
}) => {
  const safeColor = isValidHexColor(color) ? color : "#262626";

  const [hsv, setHsv] = useState<HSVColor>(() => hexToHsv(safeColor));
  const hsvRef = useRef<HSVColor>(hsv);
  hsvRef.current = hsv;

  const isDraggingSVRef = useRef(false);
  const isDraggingHueRef = useRef(false);

  const svBoxRef = useRef<HTMLDivElement>(null);
  const svThumbRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const hueThumbRef = useRef<HTMLDivElement>(null);

  // Đồng bộ trạng thái khi prop color thay đổi từ ngoài
  useEffect(() => {
    if (isValidHexColor(color)) {
      const newHsv = hexToHsv(color);
      setHsv(newHsv);
      updateSVThumb(newHsv.s, newHsv.v);
      updateHueThumb(newHsv.h);
      if (svBoxRef.current) {
        svBoxRef.current.style.backgroundColor = `hsl(${newHsv.h}, 100%, 50%)`;
      }
    }
  }, [color]);

  const updateSVThumb = (s: number, v: number) => {
    if (svThumbRef.current) {
      svThumbRef.current.style.left = `${s * 100}%`;
      svThumbRef.current.style.top = `${(1 - v) * 100}%`;
    }
  };

  const updateHueThumb = (h: number) => {
    if (hueThumbRef.current) {
      hueThumbRef.current.style.left = `${(h / 360) * 100}%`;
      hueThumbRef.current.style.backgroundColor = `hsl(${h}, 100%, 50%)`;
    }
  };

  // --- Xử lý kéo trên vùng 2D Saturation / Value ---
  const handleSVPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!svBoxRef.current) return;
    isDraggingSVRef.current = true;
    svBoxRef.current.setPointerCapture(e.pointerId);
    handleSVPointerMove(e);
  };

  const handleSVPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSVRef.current || !svBoxRef.current) return;

    const rect = svBoxRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const s = x / rect.width;
    const v = 1 - y / rect.height;

    hsvRef.current = { ...hsvRef.current, s, v };
    updateSVThumb(s, v);

    const newHex = hsvToHex(hsvRef.current.h, s, v);
    onDragColor(newHex);
  };

  const handleSVPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSVRef.current || !svBoxRef.current) return;
    isDraggingSVRef.current = false;
    try {
      svBoxRef.current.releasePointerCapture(e.pointerId);
    } catch {
      // Bỏ qua lỗi nếu pointer capture đã giải phóng
    }

    const { h, s, v } = hsvRef.current;
    setHsv({ h, s, v });
    const finalHex = hsvToHex(h, s, v);
    onCommitColor(finalHex);
  };

  // --- Xử lý kéo trên thanh Hue Slider ---
  const handleHuePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hueSliderRef.current) return;
    isDraggingHueRef.current = true;
    hueSliderRef.current.setPointerCapture(e.pointerId);
    handleHuePointerMove(e);
  };

  const handleHuePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingHueRef.current || !hueSliderRef.current) return;

    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const h =
      Math.min(360, Math.max(0, Math.round((x / rect.width) * 360))) % 360;

    hsvRef.current = { ...hsvRef.current, h };
    updateHueThumb(h);

    if (svBoxRef.current) {
      svBoxRef.current.style.backgroundColor = `hsl(${h}, 100%, 50%)`;
    }

    const newHex = hsvToHex(h, hsvRef.current.s, hsvRef.current.v);
    onDragColor(newHex);
  };

  const handleHuePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingHueRef.current || !hueSliderRef.current) return;
    isDraggingHueRef.current = false;
    try {
      hueSliderRef.current.releasePointerCapture(e.pointerId);
    } catch {
      // Bỏ qua lỗi nếu pointer capture đã giải phóng
    }

    const { h, s, v } = hsvRef.current;
    setHsv({ h, s, v });
    const finalHex = hsvToHex(h, s, v);
    onCommitColor(finalHex);
  };

  return (
    <div className="space-y-3">
      {/* 1. Vùng 2D Saturation / Value */}
      <div
        ref={svBoxRef}
        onPointerDown={handleSVPointerDown}
        onPointerMove={handleSVPointerMove}
        onPointerUp={handleSVPointerUp}
        onPointerCancel={handleSVPointerUp}
        className="relative h-32 w-full cursor-crosshair touch-none overflow-hidden rounded-lg select-none"
        style={{
          backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
        }}
      >
        {/* Lớp gradient bão hòa từ trắng sang trong suốt */}
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
        {/* Lớp gradient độ sáng từ trong suốt sang đen */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />

        {/* Con trỏ định vị màu */}
        <div
          ref={svThumbRef}
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,0.6)] ring-1 ring-black/20"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
          }}
        />
      </div>

      {/* 2. Thanh trượt dải màu (Hue Slider) */}
      <div className="px-1">
        <div
          ref={hueSliderRef}
          onPointerDown={handleHuePointerDown}
          onPointerMove={handleHuePointerMove}
          onPointerUp={handleHuePointerUp}
          onPointerCancel={handleHuePointerUp}
          className="relative h-3.5 w-full cursor-pointer touch-none rounded-full shadow-inner select-none"
          style={{
            background:
              "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
          }}
        >
          {/* Con trỏ Hue */}
          <div
            ref={hueThumbRef}
            className="pointer-events-none absolute top-1/2 h-4.5 w-4.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
            style={{
              left: `${(hsv.h / 360) * 100}%`,
              backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
