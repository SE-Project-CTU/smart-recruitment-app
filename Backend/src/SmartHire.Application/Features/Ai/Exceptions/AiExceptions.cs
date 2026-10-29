using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Ai.Exceptions;

public static class AiExceptions {
    public static AppException InvalidAccessToken(string? message = null) => new(
        AppErrorKind.Unauthorized,
        AuthErrorCodes.InvalidAccessToken,
        message ?? "The access token does not contain a valid user identity.",
        [new AppErrorDetail("userId", ValidationReasons.InvalidFormat, "A valid user identity is required.")]);

    public static AppException Validation(string message, IEnumerable<AppErrorDetail>? details = null) => new(
        AppErrorKind.Validation,
        CommonErrorCodes.ValidationError,
        message,
        details?.ToArray() ?? Array.Empty<AppErrorDetail>());

    public static AppException AiServiceUnavailable(string? message = null) => new(
        AppErrorKind.BadRequest,
        AiErrorCodes.AiServiceUnavailable,
        message ?? "Dịch vụ AI đang bận, vui lòng thử lại sau.");

    public static AppException AiQuotaExceeded(string? customGuidance = null) => new(
        AppErrorKind.BadRequest,
        AiErrorCodes.AiQuotaExceeded,
        "Hạn ngạch gọi Google Gemini AI đã vượt quá giới hạn (Quota/Rate Limit Exceeded).",
        [
            new AppErrorDetail(
                "geminiQuota",
                "RESOURCE_EXHAUSTED",
                customGuidance ?? "Dịch vụ AI đang tạm thời vượt quá hạn ngạch sử dụng (HTTP 429 Too Many Requests / RESOURCE_EXHAUSTED).\n")
        ]);

    public static AppException JobPostingNotFound(Guid jobId) => new(
        AppErrorKind.NotFound,
        AiErrorCodes.JobPostingNotFound,
        "Tin tuyển dụng không tồn tại.",
        [new AppErrorDetail("jobId", ErrorDetailReasons.NotFound, $"Tin tuyển dụng với mã {jobId} không tồn tại.")]);

    public static AppException CvNotFound() => new(
        AppErrorKind.NotFound,
        AiErrorCodes.CvNotFound,
        "Không tìm thấy hồ sơ CV.",
        [new AppErrorDetail("cvId", ErrorDetailReasons.NotFound, "Hồ sơ CV hoặc phiên bản CV chỉ định không tồn tại.")]);

    public static AppException ApplicationNotFound(Guid applicationId) => new(
        AppErrorKind.NotFound,
        AiErrorCodes.ApplicationNotFound,
        "Không tìm thấy đơn ứng tuyển.",
        [new AppErrorDetail("applicationId", ErrorDetailReasons.NotFound, $"Đơn ứng tuyển với mã {applicationId} không tồn tại.")]);

    public static AppException MatchResultNotFound(Guid applicationId) => new(
        AppErrorKind.NotFound,
        AiErrorCodes.MatchResultNotFound,
        "Đơn ứng tuyển chưa có kết quả phân tích AI.",
        [new AppErrorDetail("applicationId", ErrorDetailReasons.NotFound, $"Chưa có kết quả phân tích cho đơn ứng tuyển {applicationId}.")]);

    public static AppException NoCvEmbeddingFound(string message) => new(
        AppErrorKind.Validation,
        AiErrorCodes.NoCvEmbeddingFound,
        message,
        [new AppErrorDetail("cvEmbedding", ErrorDetailReasons.NotFound, message)]);

    public static AppException RefreshCooldownActive(int remainingSeconds) => new(
        AppErrorKind.Conflict,
        AiErrorCodes.RefreshCooldownActive,
        "Bạn vừa yêu cầu làm mới gợi ý. Vui lòng thử lại sau 5 phút.",
        [new AppErrorDetail("cooldownRemainingSeconds", remainingSeconds.ToString(), $"{remainingSeconds} seconds remaining")]);

    public static AppException Forbidden(string message) => new(
        AppErrorKind.Forbidden,
        CommonErrorCodes.AccessForbidden,
        message);

    public static AppException NotFound(string message) => new(
        AppErrorKind.NotFound,
        AiErrorCodes.ConversationNotFound,
        message);
}
