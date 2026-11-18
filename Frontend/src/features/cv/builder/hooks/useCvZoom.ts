import { useState, useCallback, useEffect, type RefObject } from "react";

export const MIN_CV_ZOOM = 0.35;
export const MAX_CV_ZOOM = 1.6;
export const DEFAULT_CV_ZOOM = 1.0;
export const CV_ZOOM_STEP = 0.05;

/**
 * Tính mức zoom tự động để vừa vặn chiều ngang container (chuẩn trang A4 ~ 794px)
 */
export function calculateFitZoom(containerWidth: number): number {
  if (containerWidth <= 0) return DEFAULT_CV_ZOOM;
  const targetWidth = Math.max(100, containerWidth - 24);
  const fitScale = targetWidth / 794;
  if (fitScale >= 1.0) return DEFAULT_CV_ZOOM;
  const clamped = Math.min(MAX_CV_ZOOM, Math.max(MIN_CV_ZOOM, fitScale));
  return Math.round(clamped * 100) / 100;
}

export interface UseCvZoomOptions {
  initialZoom?: number;
  containerRef?: RefObject<HTMLElement | null>;
  autoFitOnMobile?: boolean;
  disabled?: boolean;
}

export function useCvZoom(options?: UseCvZoomOptions) {
  const [zoom, setZoomState] = useState<number>(() => {
    if (options?.initialZoom !== undefined) return options.initialZoom;
    if (typeof window !== "undefined" && window.innerWidth < 860) {
      return calculateFitZoom(window.innerWidth - 32);
    }
    return DEFAULT_CV_ZOOM;
  });

  // Tự động căn vừa chiều rộng trên thiết bị di động / màn hình nhỏ khi mount
  useEffect(() => {
    if (
      options?.initialZoom !== undefined ||
      options?.autoFitOnMobile === false
    )
      return;

    let ro: ResizeObserver | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let initialTimer: ReturnType<typeof setTimeout> | null = null;

    const attachResizeObserver = () => {
      const container = options?.containerRef?.current;
      if (!container) return false;

      const width =
        container.clientWidth ||
        (typeof window !== "undefined" ? window.innerWidth : 1024);
      if (width > 0 && width < 860) {
        setZoomState(calculateFitZoom(width));
      }

      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.contentRect.width > 0 && entry.contentRect.width < 860) {
              setZoomState(calculateFitZoom(entry.contentRect.width));
            }
          }
        });
        ro.observe(container);
      }
      return true;
    };

    initialTimer = setTimeout(() => {
      if (!attachResizeObserver()) {
        pollInterval = setInterval(() => {
          if (attachResizeObserver() && pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        }, 150);
      }
    }, 60);

    return () => {
      if (initialTimer) clearTimeout(initialTimer);
      if (pollInterval) clearInterval(pollInterval);
      if (ro) ro.disconnect();
    };
  }, [options?.containerRef, options?.initialZoom, options?.autoFitOnMobile]);

  const zoomIn = useCallback(() => {
    setZoomState((prev) => {
      const next = Math.round((prev + CV_ZOOM_STEP) * 100) / 100;
      return Math.min(MAX_CV_ZOOM, next);
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoomState((prev) => {
      const next = Math.round((prev - CV_ZOOM_STEP) * 100) / 100;
      return Math.max(MIN_CV_ZOOM, next);
    });
  }, []);

  const resetZoom = useCallback(() => {
    const width = typeof window !== "undefined" ? window.innerWidth : 1024;
    if (width < 860) {
      setZoomState(calculateFitZoom(width - 32));
    } else {
      setZoomState(DEFAULT_CV_ZOOM);
    }
  }, []);

  const setZoom = useCallback((value: number) => {
    const clamped = Math.min(MAX_CV_ZOOM, Math.max(MIN_CV_ZOOM, value));
    setZoomState(Math.round(clamped * 100) / 100);
  }, []);

  // Lắng nghe Ctrl + Wheel để zoom mượt mà khi cuộn chuột trong container (tắt khi disabled)
  useEffect(() => {
    const container = options?.containerRef?.current;
    if (!container) return;

    let attachedContainer: HTMLElement | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

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

    const attachWheel = () => {
      const container = options?.containerRef?.current;
      if (!container) return false;
      attachedContainer = container;
      container.addEventListener("wheel", handleWheel, { passive: false });
      return true;
    };

    if (!attachWheel()) {
      pollInterval = setInterval(() => {
        if (attachWheel() && pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }, 150);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (attachedContainer) {
        attachedContainer.removeEventListener("wheel", handleWheel);
      }
    };
  }, [options?.containerRef, options?.disabled, zoomIn, zoomOut]);

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
