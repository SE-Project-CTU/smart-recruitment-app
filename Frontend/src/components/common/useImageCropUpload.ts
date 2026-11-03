import { useState, type ChangeEvent } from "react";

export type ImageUploadStep = "manage" | "crop";

export interface UseImageCropUploadOptions {
  acceptedTypes?: readonly string[];
  maxFileSizeBytes?: number;
  onUpload: (file: File) => Promise<boolean>;
  onRemove?: () => Promise<boolean>;
}

const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

export function useImageCropUpload({
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE,
  onUpload,
  onRemove,
}: UseImageCropUploadOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ImageUploadStep>("manage");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const open = () => {
    setStep("manage");
    setSelectedFile(null);
    setErrorMessage(null);
    setIsOpen(true);
  };

  const close = () => {
    if (isProcessing) return;
    setIsOpen(false);
    setStep("manage");
    setSelectedFile(null);
    setErrorMessage(null);
  };

  const chooseFile = (input: HTMLInputElement | null) => {
    if (!isProcessing) input?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!acceptedTypes.includes(file.type)) {
      setErrorMessage("Vui lòng chọn file hình ảnh PNG, JPG hoặc WEBP.");
      return;
    }

    if (file.size > maxFileSizeBytes) {
      setErrorMessage(
        `Ảnh không được vượt quá ${Math.floor(maxFileSizeBytes / (1024 * 1024))}MB.`,
      );
      return;
    }

    setSelectedFile(file);
    setStep("crop");
    setErrorMessage(null);
  };

  const backToManage = () => {
    if (isProcessing) return;
    setSelectedFile(null);
    setStep("manage");
    setErrorMessage(null);
  };

  const confirmUpload = async (croppedFile: File) => {
    if (isProcessing) return false;
    if (croppedFile.size > maxFileSizeBytes) {
      setErrorMessage(
        "Ảnh sau khi căn chỉnh vẫn vượt quá giới hạn dung lượng.",
      );
      return false;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const succeeded = await onUpload(croppedFile);
      if (!succeeded) {
        setErrorMessage("Không thể tải ảnh lên. Vui lòng thử lại.");
        return false;
      }

      setIsOpen(false);
      setStep("manage");
      setSelectedFile(null);
      return true;
    } catch {
      setErrorMessage("Không thể tải ảnh lên. Vui lòng thử lại.");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const removeImage = async () => {
    if (!onRemove || isProcessing) return false;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const succeeded = await onRemove();
      if (!succeeded) {
        setErrorMessage("Không thể xóa ảnh. Vui lòng thử lại.");
        return false;
      }

      setIsOpen(false);
      return true;
    } catch {
      setErrorMessage("Không thể xóa ảnh. Vui lòng thử lại.");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    acceptedTypes,
    canRemove: Boolean(onRemove),
    errorMessage,
    isOpen,
    isProcessing,
    selectedFile,
    step,
    backToManage,
    chooseFile,
    close,
    confirmUpload,
    handleFileChange,
    open,
    removeImage,
  };
}

export type ImageCropUploadFlow = ReturnType<typeof useImageCropUpload>;
