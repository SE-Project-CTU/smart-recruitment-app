import { toBlob } from "html-to-image";

interface CaptureCvPreviewOptions {
  pixelRatio?: number;
  backgroundColor?: string;
}

/**
 * Tỉ lệ kích thước khổ giấy A4 chuẩn quốc tế ISO 216: 210mm x 297mm
 */
const A4_ASPECT_RATIO = 297 / 210; // ~1.4142857

/**
 * Chụp ảnh giao diện CV (DOM element) theo đúng tỉ lệ khổ giấy A4 chuẩn (trang đầu tiên)
 * và chuyển thành File PNG sẵn sàng để upload làm ảnh preview/thumbnail
 *
 * @param element - Phần tử DOM của CV (container trang in A4)
 * @param cvId - ID của CV để đặt tên file
 * @param options - Tùy chọn chụp ảnh (pixelRatio, backgroundColor)
 */
export async function captureCvPreviewFile(
  element: HTMLElement,
  cvId: string,
  options?: CaptureCvPreviewOptions,
): Promise<File> {
  const pixelRatio = options?.pixelRatio ?? 2;
  const backgroundColor = options?.backgroundColor ?? "#ffffff";

  // Ưu tiên chọn đúng container trang giấy A4 nếu có (.cv-page-container)
  const targetElement =
    (element.querySelector(".cv-page-container") as HTMLElement) || element;

  // Tính toán chiều rộng và chiều cao chuẩn theo tỉ lệ A4
  const targetWidth = targetElement.offsetWidth || 794; // 794px tương đương ~210mm ở 96 DPI
  const targetHeight = Math.round(targetWidth * A4_ASPECT_RATIO); // ~1123px tương đương ~297mm

  const blob = await toBlob(targetElement, {
    pixelRatio,
    backgroundColor,
    width: targetWidth,
    height: targetHeight,
    canvasWidth: targetWidth * pixelRatio,
    canvasHeight: targetHeight * pixelRatio,
    style: {
      width: `${targetWidth}px`,
      height: `${targetHeight}px`,
      maxHeight: `${targetHeight}px`,
      overflow: "hidden", // Cắt gọn phần nội dung vượt quá trang đầu A4
      margin: "0",
      boxShadow: "none",
    },
    filter: (node) => {
      if (node instanceof HTMLElement) {
        // Loại bỏ các nút toolbar, floating actions, nút xóa/thêm item, v.v.
        if (
          node.classList.contains("no-print") ||
          node.classList.contains("cv-floating-toolbar") ||
          node.classList.contains("item-actions") ||
          node.hasAttribute("data-no-capture")
        ) {
          return false;
        }
      }
      return true;
    },
  });

  if (!blob) {
    throw new Error("Không thể trích xuất dữ liệu hình ảnh từ CV.");
  }

  return new File([blob], `cv-preview-${cvId}.png`, {
    type: "image/png",
    lastModified: Date.now(),
  });
}
