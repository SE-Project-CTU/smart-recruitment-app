using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Notifications.Exceptions;

internal static class NotificationExceptions {
    public static AppException InvalidAccessToken(string? message = null) => new(
        AppErrorKind.Unauthorized,
        AuthErrorCodes.InvalidAccessToken,
        message ?? "The access token does not contain a valid user id.",
        [new AppErrorDetail("userId", ValidationReasons.InvalidFormat, "A valid user identity is required.")]);

    public static AppException NotificationNotFound() => new(
        AppErrorKind.NotFound,
        NotificationErrorCodes.NotificationNotFound,
        "Notification was not found.",
        [new AppErrorDetail("id", ErrorDetailReasons.NotFound, "The requested notification does not exist.")]);

    public static AppException NotificationForbidden() => new(
        AppErrorKind.Forbidden,
        NotificationErrorCodes.NotificationForbidden,
        "You are not allowed to access or modify this notification.",
        [new AppErrorDetail("id", ValidationReasons.NotAllowed, "Only the notification recipient can perform this action.")]);

    public static AppException Validation(string message, IEnumerable<AppErrorDetail>? details = null) => new(
        AppErrorKind.BadRequest,
        CommonErrorCodes.ValidationError,
        message,
        details?.ToArray() ?? Array.Empty<AppErrorDetail>());
}
