import { useEffect, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { ImagePlus, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImageCropShape } from "./ImageUploadDialog";
import { createCroppedImageFile } from "./imageCropUtils";

interface ImageCropperProps {
  file: File;
  aspectRatio: number;
  shape: ImageCropShape;
  maxOutputDimension: number;
  isProcessing: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onConfirm: (croppedFile: File) => Promise<boolean>;
}

interface LoadedImage {
  file: File;
  image: HTMLImageElement;
  objectUrl: string;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

export function ImageCropper({
  file,
  aspectRatio,
  shape,
  maxOutputDimension,
  isProcessing,
  errorMessage,
  onBack,
  onConfirm,
}: ImageCropperProps) {
  const [loadedImage, setLoadedImage] = useState<LoadedImage | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<Area | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => setLoadedImage({ file, image, objectUrl });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setLoadError("Không thể đọc ảnh này. Hãy chọn một ảnh khác.");
    };
    image.src = objectUrl;

    return () => {
      image.onload = null;
      image.onerror = null;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const activeImage = loadedImage?.file === file ? loadedImage : null;
  const handleZoomChange = (value: number | readonly number[]) => {
    const nextZoom = Array.isArray(value) ? value[0] : value;
    if (typeof nextZoom === "number") setZoom(nextZoom);
  };

  const handleConfirm = async () => {
    if (!activeImage || !cropArea) return;
    try {
      setExportError(null);
      const croppedFile = await createCroppedImageFile(
        file,
        activeImage.image,
        cropArea,
        maxOutputDimension,
      );
      await onConfirm(croppedFile);
    } catch {
      setExportError("Không thể xử lý ảnh này. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative mx-auto h-[min(60vh,360px)] w-full overflow-hidden bg-[conic-gradient(#d1d5db_25%,transparent_0_50%,#d1d5db_0_75%,transparent_0)] bg-size-[20px_20px]">
        {activeImage ? (
          <Cropper
            image={activeImage.objectUrl}
            crop={crop}
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            aspect={aspectRatio}
            cropShape={shape === "circle" ? "round" : "rect"}
            cropSize={{ width: 320, height: 320 }}
            objectFit="contain"
            restrictPosition
            zoomWithScroll
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, areaPixels) => setCropArea(areaPixels)}
            classes={{
              containerClassName: "cursor-grab active:cursor-grabbing",
              cropAreaClassName: "!border-2 !border-sky-500",
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/70 text-sm text-text-muted">
            {loadError ?? "Đang đọc ảnh..."}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ZoomIn className="size-4 shrink-0 text-text-muted" />
        <SliderPrimitive.Root
          className="w-full"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={[zoom]}
          onValueChange={handleZoomChange}
          disabled={!activeImage || isProcessing}
          orientation="horizontal"
          aria-label="Phóng to ảnh"
        >
          <SliderPrimitive.Control className="relative flex h-6 w-full touch-none items-center select-none">
            <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200">
              <SliderPrimitive.Indicator className="h-full bg-primary" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
          </SliderPrimitive.Control>
        </SliderPrimitive.Root>
      </div>

      {(errorMessage || exportError) && (
        <p role="alert" className="text-sm text-status-error">
          {errorMessage ?? exportError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
        >
          Quay lại
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={!activeImage || !cropArea || isProcessing}
        >
          <ImagePlus className="size-4" />
          {isProcessing ? "Đang xử lý..." : "Dùng ảnh này"}
        </Button>
      </div>
    </div>
  );
}
