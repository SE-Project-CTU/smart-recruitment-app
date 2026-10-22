export const API_ERROR_MESSAGES: Record<string, string> = {
  CORRELATION_ID_REQUIRED: "Thiếu mã định danh yêu cầu. Vui lòng thử lại.",
  CORRELATION_ID_INVALID:
    "Mã định danh yêu cầu không hợp lệ. Vui lòng thử lại.",
  INTERNAL_SERVER_ERROR: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
  INVALID_PAGE_NUMBER: "Số trang không hợp lệ.",
  INVALID_PAGE_SIZE: "Kích thước trang không hợp lệ.",
  VALIDATION_ERROR: "Thông tin đăng ký chưa hợp lệ. Vui lòng kiểm tra lại.",
  INVALID_REQUEST_BODY: "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại.",
  AUTH_EMAIL_ALREADY_EXISTS: "Email này đã được sử dụng.",
  AUTH_PHONE_ALREADY_EXISTS: "Số điện thoại này đã được sử dụng.",
  AUTH_CANDIDATE_ROLE_NOT_FOUND:
    "Hệ thống chưa cấu hình vai trò ứng viên. Vui lòng liên hệ hỗ trợ.",
  AUTH_RECRUITER_ROLE_NOT_FOUND:
    "Hệ thống chưa cấu hình vai trò nhà tuyển dụng. Vui lòng liên hệ hỗ trợ.",
  AUTH_INVALID_CREDENTIALS: "Email hoặc mật khẩu không chính xác.",
  CURRENT_PASSWORD_INVALID: "Mật khẩu hiện tại không chính xác.",
  AUTH_ACCOUNT_NOTALLOWED: "Tài khoản hiện không được phép đăng nhập.",
  AUTH_INVALID_REFRESH_TOKEN:
    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  AUTH_REFRESH_TOKEN_NOT_FOUND:
    "Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.",
  AUTH_REFRESH_TOKEN_NOT_OWNED:
    "Phiên đăng nhập không thuộc tài khoản hiện tại.",
  AUTH_LOGOUT_TARGET_REQUIRED: "Không tìm thấy phiên đăng xuất.",
  AUTH_INVALID_ACCESS_TOKEN:
    "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  AUTH_CURRENT_ACCOUNT_NOT_FOUND: "Không tìm thấy tài khoản hiện tại.",
  AUTH_AVATAR_FILE_NOT_FOUND: "Không tìm thấy ảnh đại diện.",
  AUTH_AVATAR_FILE_NOT_OWNED: "Ảnh đại diện không thuộc tài khoản hiện tại.",
  MEDIA_FILE_NOT_FOUND: "Không tìm thấy tệp.",
  MEDIA_FILE_FORBIDDEN: "Bạn không có quyền truy cập tệp này.",
  MEDIA_FILE_STORAGE_ERROR: "Không thể lưu tệp. Vui lòng thử lại.",
  MEDIA_FILE_DELETE_STORAGE_ERROR: "Không thể xóa tệp. Vui lòng thử lại.",
  COMPANY_NOT_FOUND: "Không tìm thấy thông tin doanh nghiệp.",
  COMPANY_TAX_CODE_ALREADY_EXISTS: "Mã số thuế này đã được đăng ký trên hệ thống.",
  COMPANY_FORBIDDEN: "Bạn không có quyền thực hiện thao tác trên doanh nghiệp này.",
  NOT_COMPANY_OWNER: "Chỉ Chủ sở hữu (Owner) mới có quyền thực hiện hành động này.",
  COMPANY_MEMBERSHIP_NOT_FOUND: "Không tìm thấy tư cách thành viên trong doanh nghiệp.",
  COMPANY_MEMBERSHIP_ALREADY_EXISTS: "Nhà tuyển dụng này đã là thành viên của doanh nghiệp.",
  COMPANY_INVITATION_NOT_FOUND: "Không tìm thấy lời mời tham gia doanh nghiệp.",
  COMPANY_INVITATION_ALREADY_EXISTS: "Đã có một lời mời đang chờ xử lý gửi tới nhân sự này.",
  COMPANY_INVITATION_ALREADY_PROCESSED: "Lời mời này đã được phản hồi trước đó.",
  COMPANY_INVITATION_EXPIRED: "Lời mời tham gia doanh nghiệp đã hết hạn hiệu lực.",
  COMPANY_JOIN_REQUEST_NOT_FOUND: "Không tìm thấy yêu cầu gia nhập doanh nghiệp.",
  COMPANY_JOIN_REQUEST_ALREADY_EXISTS: "Bạn đã gửi yêu cầu gia nhập doanh nghiệp này trước đó.",
  COMPANY_JOIN_REQUEST_ALREADY_PROCESSED: "Yêu cầu gia nhập này đã được xét duyệt.",
  COMPANY_ALREADY_FOLLOWED: "Bạn đã theo dõi doanh nghiệp này.",
  COMPANY_NOT_FOLLOWED: "Bạn chưa theo dõi doanh nghiệp này.",
  COMPANY_NEW_OWNER_INVALID: "Thành viên nhận chuyển nhượng quyền Owner không hợp lệ.",
  INVALID_COMPANY_DATA: "Dữ liệu thông tin doanh nghiệp không hợp lệ.",
  USER_NOT_FOUND: "Không tìm thấy tài khoản người dùng tương ứng.",
  COMPANY_LOGO_ALREADY_IN_USE: "Logo này đã được gán cho một doanh nghiệp khác.",
};

export const FIELD_LABELS: Record<string, string> = {
  email: "email",
  phone: "số điện thoại",
  password: "mật khẩu",
  fullName: "họ và tên",
  currentPassword: "mật khẩu hiện tại",
  newPassword: "mật khẩu mới",
};

export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại.",
  401: "Thông tin xác thực không hợp lệ. Vui lòng đăng nhập lại.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu yêu cầu.",
  409: "Thông tin bị trùng hoặc xung đột với dữ liệu hiện có.",
  422: "Thông tin nhập vào chưa hợp lệ. Vui lòng kiểm tra lại.",
  500: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
  502: "Máy chủ tạm thời không phản hồi. Vui lòng thử lại sau.",
  503: "Dịch vụ hiện không khả dụng. Vui lòng thử lại sau.",
  504: "Máy chủ phản hồi quá thời gian. Vui lòng thử lại sau.",
};
