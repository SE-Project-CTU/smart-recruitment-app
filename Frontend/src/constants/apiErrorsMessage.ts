export const API_ERROR_MESSAGES: Record<string, string> = {
  CORRELATION_ID_REQUIRED: "Thiếu mã định danh yêu cầu. Vui lòng thử lại.",
  CORRELATION_ID_INVALID:
    "Mã định danh yêu cầu không hợp lệ. Vui lòng thử lại.",
  INTERNAL_SERVER_ERROR: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
  INVALID_PAGE_NUMBER: "Số trang không hợp lệ.",
  INVALID_PAGE_SIZE: "Kích thước trang không hợp lệ.",
  INVALID_SEARCH_QUERY: "Tiêu chí tìm kiếm không hợp lệ.",
  VALIDATION_ERROR: "Thông tin nhập vào chưa hợp lệ. Vui lòng kiểm tra lại.",
  INVALID_REQUEST_BODY: "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại.",
  AUTHENTICATION_REQUIRED: "Vui lòng đăng nhập để thực hiện thao tác này.",
  ACCESS_FORBIDDEN: "Bạn không có quyền truy cập tài nguyên này.",
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
  MEDIA_FILE_IN_USE: "Tệp phương tiện đang được sử dụng và không thể xóa.",
  COMPANY_NOT_FOUND: "Không tìm thấy thông tin doanh nghiệp.",
  COMPANY_TAX_CODE_ALREADY_EXISTS:
    "Mã số thuế này đã được đăng ký trên hệ thống.",
  COMPANY_FORBIDDEN:
    "Bạn không có quyền thực hiện thao tác trên doanh nghiệp này.",
  NOT_COMPANY_OWNER:
    "Chỉ Chủ sở hữu (Owner) mới có quyền thực hiện hành động này.",
  COMPANY_MEMBERSHIP_NOT_FOUND:
    "Không tìm thấy tư cách thành viên trong doanh nghiệp.",
  COMPANY_MEMBERSHIP_ALREADY_EXISTS:
    "Nhà tuyển dụng này đã là thành viên của doanh nghiệp.",
  COMPANY_INVITATION_NOT_FOUND: "Không tìm thấy lời mời tham gia doanh nghiệp.",
  COMPANY_INVITATION_ALREADY_EXISTS:
    "Đã có một lời mời đang chờ xử lý gửi tới nhân sự này.",
  COMPANY_INVITATION_ALREADY_PROCESSED:
    "Lời mời này đã được phản hồi trước đó.",
  COMPANY_INVITATION_EXPIRED:
    "Lời mời tham gia doanh nghiệp đã hết hạn hiệu lực.",
  COMPANY_JOIN_REQUEST_NOT_FOUND:
    "Không tìm thấy yêu cầu gia nhập doanh nghiệp.",
  COMPANY_JOIN_REQUEST_ALREADY_EXISTS:
    "Bạn đã gửi yêu cầu gia nhập doanh nghiệp này trước đó.",
  COMPANY_JOIN_REQUEST_ALREADY_PROCESSED:
    "Yêu cầu gia nhập này đã được xét duyệt.",
  COMPANY_ALREADY_FOLLOWED: "Bạn đã theo dõi doanh nghiệp này.",
  COMPANY_NOT_FOLLOWED: "Bạn chưa theo dõi doanh nghiệp này.",
  COMPANY_NEW_OWNER_INVALID:
    "Thành viên nhận chuyển nhượng quyền Owner không hợp lệ.",
  INVALID_COMPANY_DATA: "Dữ liệu thông tin doanh nghiệp không hợp lệ.",
  USER_NOT_FOUND: "Không tìm thấy tài khoản người dùng tương ứng.",
  COMPANY_LOGO_ALREADY_IN_USE:
    "Logo này đã được gán cho một doanh nghiệp khác.",
  MAX_OWNED_COMPANIES_REACHED:
    "Bạn đã đạt giới hạn tối đa số lượng doanh nghiệp được sở hữu (tối đa 5 doanh nghiệp).",
  INVITEE_ROLE_REQUIRED:
    "Tài khoản được mời phải có vai trò Nhà tuyển dụng (Recruiter).",
  INVALID_JOB_POSTING_DATA:
    "Thông tin tin tuyển dụng chưa hợp lệ. Vui lòng kiểm tra lại.",
  INVALID_JOB_POSTING_ID: "Mã tin tuyển dụng không đúng định dạng.",
  JOB_POSTING_NOT_FOUND: "Không tìm thấy tin tuyển dụng.",
  JOB_POSTING_FORBIDDEN:
    "Bạn không có quyền chỉnh sửa hoặc tạo tin cho doanh nghiệp này.",
  PROVINCE_NOT_FOUND:
    "Tỉnh/Thành phố được chọn không tồn tại hoặc đã ngừng hoạt động.",
  WARD_NOT_FOUND:
    "Phường/Xã không tồn tại hoặc không thuộc tỉnh/thành phố đã chọn.",
  INDUSTRY_NOT_FOUND: "Ngành nghề được chọn không hợp lệ.",
  SKILL_NOT_FOUND: "Kỹ năng được chọn không hợp lệ.",
  INVALID_JOB_POSTING_SEARCH: "Tiêu chí tìm kiếm tin tuyển dụng không hợp lệ.",
  JOB_ALREADY_BOOKMARKED: "Tin tuyển dụng này đã được lưu vào danh sách quan tâm của bạn.",
  JOB_BOOKMARK_NOT_FOUND: "Tin tuyển dụng chưa được lưu trong danh sách quan tâm.",
  CANNOT_BOOKMARK_UNPUBLISHED_JOB: "Chỉ có thể lưu các tin tuyển dụng đang công khai.",
  JOB_POSTING_UNAUTHORIZED: "Vui lòng đăng nhập để xem thông tin tin tuyển dụng này.",
  JOB_POSTING_CONFLICT: "Trạng thái tin tuyển dụng đã có sự thay đổi. Vui lòng tải lại trang.",
  INDUSTRY_GROUP_NOT_FOUND: "Không tìm thấy nhóm ngành tương ứng.",
  // CV Error Codes
  CV_CANDIDATE_ROLE_REQUIRED: "Chỉ ứng viên mới có quyền quản lý hồ sơ CV.",
  CV_NOT_FOUND: "Không tìm thấy hồ sơ CV.",
  CV_CV_NOT_FOUND: "Không tìm thấy hồ sơ CV.",
  CV_NOT_OWNED: "Bạn không có quyền truy cập hồ sơ CV này.",
  CV_VERSION_NOT_FOUND: "Không tìm thấy phiên bản CV yêu cầu.",
  CV_UPDATE_CONFLICT: "Hồ sơ CV đã được cập nhật bởi một phiên làm việc khác.",
  CV_PREVIEW_FILE_ALREADY_IN_USE:
    "File xem trước đang được sử dụng bởi một CV khác.",
  CV_TEMPLATE_NOT_FOUND: "Không tìm thấy mẫu CV.",
  CV_TEMPLATE_INACTIVE: "Mẫu CV này hiện đã tạm ngưng hỗ trợ.",
  // Application Error Codes
  INVALID_APPLICATION:
    "Thông tin hồ sơ ứng tuyển không hợp lệ. Vui lòng kiểm tra lại.",
  JOB_NOT_ACCEPTING_APPLICATIONS:
    "Tin tuyển dụng này hiện đã dừng tiếp nhận hồ sơ ứng tuyển.",
  APPLICATION_ALREADY_EXISTS:
    "Bạn đã nộp hồ sơ ứng tuyển vào vị trí này trước đó.",
  UPLOADED_CV_FILE_NOT_FOUND: "Không tìm thấy tệp CV tải lên.",
  UPLOADED_CV_NOT_PDF: "Tệp CV tải lên bắt buộc phải ở định dạng PDF.",
  UPLOADED_CV_TOO_LARGE:
    "Dung lượng tệp CV vượt quá giới hạn cho phép (tối đa 5 MB).",
  UPLOADED_CV_ALREADY_USED: "Tệp CV này đã được sử dụng.",
  INVALID_APPLICATION_QUERY: "Tham số truy vấn hồ sơ ứng tuyển không hợp lệ.",
  INVALID_APPLICATION_ID: "Mã hồ sơ ứng tuyển không hợp lệ.",
  APPLICATION_NOT_FOUND: "Không tìm thấy thông tin đơn ứng tuyển.",
  APPLICATION_FORBIDDEN: "Bạn không có quyền thao tác trên đơn ứng tuyển này.",
  INVALID_APPLICATION_STATUS_TRANSITION:
    "Chuyển đổi trạng thái đơn ứng tuyển không hợp lệ theo quy trình.",
  APPLICATION_STATUS_CONFLICT:
    "Trạng thái đơn ứng tuyển đã có sự thay đổi. Vui lòng tải lại trang.",
  // Notification Error Codes
  NOTIFICATION_NOT_FOUND: "Không tìm thấy thông báo.",
  NOTIFICATION_FORBIDDEN: "Bạn không có quyền truy cập thông báo này.",

  // Admin Error Codes
  ADMIN_USER_NOT_FOUND: "Không tìm thấy tài khoản người dùng tương ứng.",
  ADMIN_CANNOT_LOCK_LAST_ADMIN:
    "Không thể khóa tài khoản Quản trị viên (Admin) duy nhất còn hoạt động trong hệ thống.",
  ADMIN_COMPANY_NOT_FOUND: "Không tìm thấy thông tin doanh nghiệp.",
  ADMIN_COMPANY_ALREADY_VERIFIED:
    "Doanh nghiệp đã ở trạng thái xét duyệt này trước đó.",
  ADMIN_INVALID_STATUS_TRANSITION:
    "Chuyển đổi trạng thái xét duyệt doanh nghiệp không hợp lệ.",
  ADMIN_REASON_REQUIRED: "Vui lòng nhập lý do từ chối.",
  ADMIN_JOB_POSTING_NOT_FOUND: "Không tìm thấy tin tuyển dụng.",
  ADMIN_COMPANY_NOT_VERIFIED_FOR_JOB_APPROVAL:
    "Doanh nghiệp liên kết bắt buộc phải được xác thực trước khi phê duyệt tin tuyển dụng.",
  ADMIN_JOB_ALREADY_MODERATED:
    "Tin tuyển dụng không ở trạng thái chờ duyệt (PendingReview) để kiểm duyệt.",
  ADMIN_INDUSTRY_GROUP_NOT_FOUND: "Không tìm thấy nhóm ngành tương ứng.",
  ADMIN_INDUSTRY_GROUP_NAME_ALREADY_EXISTS:
    "Tên nhóm ngành này đã tồn tại trên hệ thống.",
  ADMIN_INDUSTRY_NOT_FOUND: "Không tìm thấy ngành nghề tương ứng.",
  ADMIN_INDUSTRY_NAME_ALREADY_EXISTS:
    "Tên ngành nghề này đã tồn tại trên hệ thống.",
  ADMIN_PROVINCE_NOT_FOUND: "Không tìm thấy Tỉnh/Thành phố tương ứng.",
  ADMIN_PROVINCE_NAME_ALREADY_EXISTS:
    "Tên Tỉnh/Thành phố này đã tồn tại trên hệ thống.",
  ADMIN_WARD_NOT_FOUND: "Không tìm thấy Phường/Xã tương ứng.",
  ADMIN_WARD_NAME_ALREADY_EXISTS:
    "Tên Phường/Xã này đã tồn tại trong Tỉnh/Thành phố đã chọn.",
  ADMIN_SKILL_NOT_FOUND: "Không tìm thấy kỹ năng tương ứng.",
  ADMIN_SKILL_NAME_ALREADY_EXISTS:
    "Tên kỹ năng này đã tồn tại trên hệ thống.",
  ADMIN_CV_TEMPLATE_NOT_FOUND: "Không tìm thấy mẫu CV tiêu chuẩn.",
  ADMIN_CV_TEMPLATE_CODE_ALREADY_EXISTS:
    "Mã định danh (code) của mẫu CV này đã tồn tại.",

  // Admin Notification Error Codes
  ADMIN_NOTIFICATION_NOT_FOUND: "Không tìm thấy thông báo hệ thống.",
  ADMIN_NOTIFICATION_TITLE_REQUIRED: "Tiêu đề thông báo không được để trống.",
  ADMIN_NOTIFICATION_BODY_REQUIRED: "Nội dung thông báo không được để trống.",
  ADMIN_NOTIFICATION_PAYLOAD_TOO_LARGE:
    "Dữ liệu đính kèm thông báo vượt quá độ dài cho phép (tối đa 512 ký tự).",
  ADMIN_NOTIFICATION_TARGET_REQUIRED: "Vui lòng chọn đối tượng nhận thông báo.",
  ADMIN_NOTIFICATION_INVALID_TARGET_ROLE: "Vai trò nhận thông báo không hợp lệ.",
  ADMIN_NOTIFICATION_RECIPIENT_NOT_FOUND:
    "Không tìm thấy người nhận thông báo hợp lệ.",
  ADMIN_NOTIFICATION_DISPATCH_FAILED:
    "Gửi thông báo thời gian thực thất bại. Vui lòng thử lại sau.",
  ADMIN_NOTIFICATION_FAILED: "Không thể tạo thông báo. Vui lòng thử lại sau.",

  // AI Error Codes
  AI_SERVICE_UNAVAILABLE: "Dịch vụ AI đang bận hoặc tạm thời gián đoạn. Vui lòng thử lại sau.",
  AI_QUOTA_EXCEEDED: "Hạn ngạch gọi dịch vụ AI tạm thời vượt quá giới hạn. Vui lòng thử lại sau.",
  RESOURCE_EXHAUSTED: "Dịch vụ AI đang quá tải yêu cầu. Vui lòng thử lại sau ít phút.",
  AI_JOB_NOT_FOUND: "Không tìm thấy tin tuyển dụng tương ứng.",
  AI_CV_NOT_FOUND: "Chưa có nội dung hồ sơ CV để thực hiện gợi ý việc làm.",
  NO_CV_EMBEDDING_FOUND: "Chưa thể trích xuất đặc trưng hồ sơ CV. Vui lòng cập nhật thêm thông tin.",
  REFRESH_COOLDOWN_ACTIVE: "Bạn vừa làm mới gợi ý. Vui lòng chờ một chút trước khi thử lại.",
  AI_MATCH_RESULT_NOT_FOUND: "Chưa có kết quả phân tích độ phù hợp.",
  CONVERSATION_NOT_FOUND: "Không tìm thấy cuộc trò chuyện với trợ lý AI.",
};

export const FIELD_LABELS: Record<string, string> = {
  email: "email",
  phone: "số điện thoại",
  password: "mật khẩu",
  fullName: "họ và tên",
  currentPassword: "mật khẩu hiện tại",
  newPassword: "mật khẩu mới",
  name: "tên",
  taxCode: "mã số thuế",
  address: "địa chỉ trụ sở chính",
  website: "website",
  description: "mô tả",
  title: "tiêu đề tin tuyển dụng",
  company: "doanh nghiệp",
  companyId: "doanh nghiệp",
  logoFileId: "ảnh logo",
  provinceId: "tỉnh/thành phố",
  wardId: "phường/xã",
  groupId: "nhóm ngành",
  detailedLocation: "địa chỉ cụ thể",
  experienceYears: "số năm kinh nghiệm",
  jobLevel: "cấp bậc",
  educationLevel: "trình độ học vấn",
  vacancies: "số lượng cần tuyển",
  workMode: "hình thức làm việc",
  jobType: "loại hình làm việc",
  requirements: "yêu cầu công việc",
  benefits: "chế độ đãi ngộ",
  salaryMin: "mức lương tối thiểu",
  salaryMax: "mức lương tối đa",
  deadline: "hạn nộp hồ sơ",
  industryIds: "ngành nghề",
  skillIds: "kỹ năng yêu cầu",
  coverLetter: "thư giới thiệu",
  templateId: "mẫu CV",
  cvVersionId: "phiên bản CV",
  uploadedCvFileId: "tệp CV tải lên",
  thumbnailFileId: "ảnh xem trước",
  rejectionReason: "lý do từ chối",
  code: "mã định danh",
  isCentrallyGoverned: "trực thuộc trung ương",
  isCommune: "xã/thị trấn",
  targetRole: "đối tượng nhận thông báo",
  targetType: "phạm vi gửi thông báo",
  notificationType: "loại thông báo",
  expiresAt: "thời hạn thông báo",
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
