import { AxiosError } from "axios";

// handle tạm thời thui, sẽ fix lại cụ thể hơn sau này
export const handleApiError = (error: AxiosError) => {
  if (error.response) {
    const status = error.response.status;

    switch (status) {
      case 401:
        console.error("Phiên đăng nhập hết hạn hoặc chưa xác thực (401).");
        break;
      case 403:
        console.error("Bạn không có quyền truy cập tài nguyên này (403).");
        break;
      case 404:
        console.error("Không tìm thấy tài nguyên yêu cầu (404).");
        break;
      case 500:
        console.error("Lỗi hệ thống máy chủ (500).");
        break;
      default:
        console.error(`Lỗi API [${status}]:`, error.response.data);
    }
  } else if (error.request) {
    console.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng!");
  } else {
    console.error("Lỗi khởi tạo Request:", error.message);
  }
};
