/**
 * Sinh danh sách số trang hiển thị dạng pagination.
 * Khi totalPages <= 10: hiển thị đầy đủ [1..totalPages].
 * Khi totalPages > 10: rút gọn bằng dấu "..." tùy theo vị trí currentPage.
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 1) return [1];

  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Đầu danh sách (trang 1..4)
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  // Cuối danh sách (cách trang cuối <= 3)
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // Ở giữa
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}
