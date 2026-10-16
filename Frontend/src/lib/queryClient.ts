import { QueryClient } from "@tanstack/react-query";

/**
 * Cấu hình tập trung cho TanStack Query
 *
 * Ghi chú cho người mới:
 * - `staleTime`: Thời gian dữ liệu được coi là "còn mới" (tính bằng ms). Trong thời gian này,
 *   React Query sẽ không gọi lại API ngầm mà dùng trực tiếp cache.
 * - `gcTime` (trước đây là cacheTime): Thời gian lưu cache trong bộ nhớ trước khi bị dọn dẹp rác (Garbage Collected).
 * - `retry`: Số lần tự động thử lại khi API gặp lỗi mạng.
 * - `refetchOnWindowFocus`: Có tự gọi lại API khi người dùng click lại tab trình duyệt hay không.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 2 phút
      staleTime: 1000 * 60 * 2,

      // Cache tồn tại trong 10 phút sau khi component unmount
      gcTime: 1000 * 60 * 10,

      // Khi lỗi, chỉ thử lại 1 lần để tránh spam backend
      retry: 1,

      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
