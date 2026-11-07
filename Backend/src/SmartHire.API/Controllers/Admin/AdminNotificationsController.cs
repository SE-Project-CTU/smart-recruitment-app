using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Application.Abstractions.Notifications;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Notifications.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Api.Controllers.Admin;

public sealed record SendSystemAlertRequest(
    string? Target,
    string Title,
    string Body
);

[ApiController]
[Authorize(Roles = RoleNames.Admin)]
[Route("api/v1/admin/notifications")]
public sealed class AdminNotificationsController : ControllerBase {
    private readonly INotificationDispatcher _notificationDispatcher;
    private readonly ApiResponseFactory _responseFactory;

    public AdminNotificationsController(
        INotificationDispatcher notificationDispatcher,
        ApiResponseFactory responseFactory) {
        _notificationDispatcher = notificationDispatcher;
        _responseFactory = responseFactory;
    }

    /// <summary>
    /// Phát cảnh báo / thông báo hệ thống realtime tới SignalR group (Toàn server hoặc theo Role)
    /// </summary>
    [HttpPost("alert")]
    public async Task<IActionResult> SendAlert(
        [FromBody] SendSystemAlertRequest request,
        CancellationToken cancellationToken = default) {
        if (string.IsNullOrWhiteSpace(request.Title)) {
            throw new AppException(
                AppErrorKind.Validation,
                AdminErrorCodes.NotificationTitleRequired,
                "Title is required.",
                [new AppErrorDetail("title", ValidationReasons.Required, "Tiêu đề thông báo không được để trống.")]);
        }

        if (string.IsNullOrWhiteSpace(request.Body)) {
            throw new AppException(
                AppErrorKind.Validation,
                AdminErrorCodes.NotificationBodyRequired,
                "Body is required.",
                [new AppErrorDetail("body", ValidationReasons.Required, "Nội dung thông báo không được để trống.")]);
        }

        var trimmedTitle = request.Title.Trim();
        var trimmedBody = request.Body.Trim();
        var now = DateTimeOffset.UtcNow;

        var dto = new NotificationDto(
            Id: Guid.NewGuid(),
            RecipientId: Guid.Empty,
            Type: NotificationType.SystemAlert.ToString(),
            Title: trimmedTitle,
            Body: trimmedBody,
            Payload: null,
            ResourceType: "System",
            ResourceId: null,
            CreatedAt: now,
            ReadAt: null,
            ExpiresAt: null,
            IsRead: false
        );

        string targetGroupDisplay;
        if (string.Equals(request.Target, "Candidate", StringComparison.OrdinalIgnoreCase)) {
            await _notificationDispatcher.DispatchToRoleAsync("candidate", dto, cancellationToken);
            targetGroupDisplay = "Candidate";
        } else if (string.Equals(request.Target, "Recruiter", StringComparison.OrdinalIgnoreCase)) {
            await _notificationDispatcher.DispatchToRoleAsync("recruiter", dto, cancellationToken);
            targetGroupDisplay = "Recruiter";
        } else {
            // Mặc định hoặc All: phát tới group system:all
            await _notificationDispatcher.DispatchBroadcastAsync(dto, cancellationToken);
            targetGroupDisplay = "SystemAll";
        }

        return Ok(_responseFactory.Success(new {
            target = targetGroupDisplay,
            title = trimmedTitle,
            sentAt = now,
            message = "Thông báo hệ thống đã được phát thành công tới người dùng."
        }));
    }
}

