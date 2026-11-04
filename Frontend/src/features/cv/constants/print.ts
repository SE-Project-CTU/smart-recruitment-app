/**
 * Cấu hình in ấn chuẩn cho CV:
 * - Khổ giấy A4.
 * - Lề dọc 8mm (trên/dưới) được trình duyệt lặp lại nhất quán qua từng trang.
 * - Lề ngang 0mm (khoảng đệm trái/phải do template quản lý qua px).
 * - Tắt bóng đổ, khử margin/padding thừa của body khi in.
 */
export const CV_PRINT_PAGE_STYLE = `
  @page {
    size: A4;
    margin: 8mm 0;
  }
  @media print {
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .cv-zoom-viewport,
    .print-container {
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
      zoom: 1 !important;
      height: auto !important;
    }
    .cv-page-container {
      margin: 0 !important;
      box-shadow: none !important;
      transform: none !important;
      zoom: 1 !important;
    }
  }
`;
