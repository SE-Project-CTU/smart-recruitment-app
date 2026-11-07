import { useRef, useState } from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageCropper } from "./ImageCropper";
import type { ImageCropUploadFlow } from "./useImageCropUpload";

export type ImageCropShape = "circle" | "square" | "rectangle";

interface ImageUploadDialogProps {
  flow: ImageCropUploadFlow;
  currentImageUrl?: string | null;
  imageAlt?: string;
  title?: string;
  description?: string;
  aspectRatio: number;
  shape: ImageCropShape;
  maxOutputDimension?: number;
}

export function ImageUploadDialog({
  flow,
  currentImageUrl,
  imageAlt = "Ảnh hiện tại",
  title = "Quản lý ảnh",
  description = "Chọn ảnh mới để căn chỉnh trước khi sử dụng.",
  aspectRatio,
  shape,
  maxOutputDimension = 512,
}: ImageUploadDialogProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog
      open={flow.isOpen}
      onOpenChange={(open) => {
        if (open) flow.open();
        else flow.close();
      }}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
        showCloseButton={!flow.isProcessing}
      >
        {flow.step === "manage" ? (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <input
              ref={fileInputRef}
              type="file"
              accept={flow.acceptedTypes.join(",")}
              className="hidden"
              onChange={flow.handleFileChange}
              disabled={flow.isProcessing}
            />

            <div className="flex justify-center py-2">
              <div
                className={`flex size-40 items-center justify-center overflow-hidden bg-slate-100 ring-4 ring-white ${shape === "circle" ? "rounded-full" : "rounded-md"}`}
              >
                {currentImageUrl && failedImageUrl !== currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt={imageAlt}
                    className="size-full object-cover"
                    onError={() => setFailedImageUrl(currentImageUrl)}
                  />
                ) : (
                  <div className="flex flex-col items-center text-text-muted">
                    <Camera className="size-10" />
                    <span className="mt-2 text-xs">Chưa có ảnh</span>
                  </div>
                )}
              </div>
            </div>

            {flow.errorMessage && (
              <p role="alert" className="text-sm text-status-error">
                {flow.errorMessage}
              </p>
            )}

            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between">
              {currentImageUrl && flow.canRemove ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void flow.removeImage()}
                  disabled={flow.isProcessing}
                >
                  <Trash2 className="size-4" />
                  Xóa ảnh
                </Button>
              ) : (
                <span />
              )}
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={flow.close}
                  disabled={flow.isProcessing}
                >
                  Đóng
                </Button>
                <Button
                  type="button"
                  onClick={() => flow.chooseFile(fileInputRef.current)}
                  disabled={flow.isProcessing}
                >
                  <Upload className="size-4" />
                  Tải ảnh lên
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Căn chỉnh ảnh</DialogTitle>
              <DialogDescription>
                Kéo ảnh để di chuyển. Cuộn chuột hoặc dùng thanh zoom để phóng
                to, thu nhỏ.
              </DialogDescription>
            </DialogHeader>
            {flow.selectedFile && (
              <ImageCropper
                key={`${flow.selectedFile.name}-${flow.selectedFile.size}-${flow.selectedFile.lastModified}`}
                file={flow.selectedFile}
                aspectRatio={aspectRatio}
                shape={shape}
                maxOutputDimension={maxOutputDimension}
                isProcessing={flow.isProcessing}
                errorMessage={flow.errorMessage}
                onBack={flow.backToManage}
                onConfirm={flow.confirmUpload}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ImageUploadDialog;
