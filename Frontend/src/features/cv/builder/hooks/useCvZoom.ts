import { useState, useCallback, useEffect, type RefObject } from "react";

export const MIN_CV_ZOOM = 0.5;
export const MAX_CV_ZOOM = 1.5;
export const DEFAULT_CV_ZOOM = 1.0;
export const CV_ZOOM_STEP = 0.1;

export interface UseCvZoomOptions {
  initialZoom?: number;
  containerRef?: RefObject<HTMLElement | null>;
}

export function useCvZoom(options?: UseCvZoomOptions) {
  const [zoom, setZoomState] = useState<number>(
    options?.initialZoom ?? DEFAULT_CV_ZOOM,
  );

  const zoomIn = useCallback(() => {
    setZoomState((prev) => {
      const next = Math.round((prev + CV_ZOOM_STEP) * 10) / 10;
      return Math.min(MAX_CV_ZOOM, next);
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoomState((prev) => {
      const next = Math.round((prev - CV_ZOOM_STEP) * 10) / 10;
      return Math.max(MIN_CV_ZOOM, next);
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoomState(DEFAULT_CV_ZOOM);
  }, []);

  const setZoom = useCallback((value: number) => {
    const clamped = Math.min(MAX_CV_ZOOM, Math.max(MIN_CV_ZOOM, value));
    setZoomState(Math.round(clamped * 100) / 100);
  }, []);

  // Lắng nghe Ctrl + Wheel để zoom mượt mà khi cuộn chuột trong container
  useEffect(() => {
    const container = options?.containerRef?.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          zoomIn();
        } else if (e.deltaY > 0) {
          zoomOut();
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [options?.containerRef, zoomIn, zoomOut]);

  return {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    canZoomIn: zoom < MAX_CV_ZOOM,
    canZoomOut: zoom > MIN_CV_ZOOM,
  };
}
