export type ImageCropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function createCroppedImageFile(
  sourceFile: File,
  image: HTMLImageElement,
  crop: ImageCropRect,
  maxOutputDimension: number,
): Promise<File> {
  if (!SUPPORTED_IMAGE_TYPES.has(sourceFile.type)) {
    throw new Error("Định dạng ảnh không được hỗ trợ.");
  }

  if (
    !Number.isFinite(maxOutputDimension) ||
    maxOutputDimension <= 0 ||
    crop.width <= 0 ||
    crop.height <= 0
  ) {
    throw new Error("Vùng crop ảnh không hợp lệ.");
  }

  const outputScale = Math.min(
    1,
    maxOutputDimension / Math.max(crop.width, crop.height),
  );
  const outputWidth = Math.max(1, Math.round(crop.width * outputScale));
  const outputHeight = Math.max(1, Math.round(crop.height * outputScale));
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Trình duyệt không thể xử lý ảnh này.");
  }

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Không thể tạo ảnh đã crop."));
      },
      sourceFile.type,
      sourceFile.type === "image/jpeg" || sourceFile.type === "image/webp"
        ? 0.92
        : undefined,
    );
  });

  return new File([blob], sourceFile.name, {
    type: sourceFile.type,
    lastModified: Date.now(),
  });
}
