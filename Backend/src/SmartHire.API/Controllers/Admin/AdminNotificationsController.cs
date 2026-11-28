using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Application.Abstractions.Notifications;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Notifications.DTOs;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Api.Controllers.Admin;

public sealed record SendSystemAlertRequest(
    string? Target,
    string Title,
    string Body,
    string? AlertLevel
);

[ApiController]
[Authorize(Roles = RoleNames.Admin)]
[Route("api/v1/admin/notifications")]
public sealed class AdminNotificationsController : ControllerBase {
    private readonly INotificationDispatcher _notificationDispatcher;
    private readonly IUserRepository _userRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ApiResponseFactory _responseFactory;

    public AdminNotificationsController(
        INotificationDispatcher notificationDispatcher,
        IUserRepository userRepository,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        ApiResponseFactory responseFactory) {
        _notificationDispatcher = notificationDispatcher;
        _userRepository = userRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _responseFactory = responseFactory;
    }

    /// <summary>
    /// Phát cảnh báo / thông báo hệ thống realtime tới SignalR group và lưu vào lịch sử thông báo của người dùng
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

        if (trimmedTitle.Length > 200) {
            throw new AppException(
                AppErrorKind.Validation,
                AdminErrorCodes.NotificationPayloadTooLarge,
                "Title exceeds maximum length of 200 characters.",
                [new AppErrorDetail("title", ValidationReasons.MaxLength, "Tiêu đề thông báo không được vượt quá 200 ký tự.")]);
        }

        if (trimmedBody.Length > 2000) {
            throw new AppException(
                AppErrorKind.Validation,
                AdminErrorCodes.NotificationPayloadTooLarge,
                "Body exceeds maximum length of 2000 characters.",
                [new AppErrorDetail("body", ValidationReasons.MaxLength, "Nội dung thông báo không được vượt quá 2000 ký tự.")]);
        }

        var now = DateTimeOffset.UtcNow;

        var alertLevel = request.AlertLevel?.Trim().ToLowerInvariant() switch {
            "info" => "info",
            "warning" => "warning",
            "error" => "error",
            _ => "general"
        };

        var payloadJson = $"{{\"level\":\"{alertLevel}\"}}";
        using var jsonDoc = JsonDocument.Parse(payloadJson);
        var payloadElement = jsonDoc.RootElement.Clone();

        if (string.IsNullOrWhiteSpace(request.Target)) {
            throw new AppException(
                AppErrorKind.Validation,
                AdminErrorCodes.NotificationTargetRequired,
                "Target is required.",
                [new AppErrorDetail("target", ValidationReasons.Required, "Vui lòng chọn đối tượng nhận thông báo.")]);
        }

        var trimmedTarget = request.Target.Trim();
        string? roleFilter = null;
        string targetGroupDisplay;
        if (string.Equals(trimmedTarget, "Candidate", StringComparison.OrdinalIgnoreCase)) {
            roleFilter = "Candidate";
            targetGroupDisplay = "Candidate";
        } else if (string.Equals(trimmedTarget, "Recruiter", StringComparison.OrdinalIgnoreCase)) {
            roleFilter = "Recruiter";
            targetGroupDisplay = "Recruiter";
        } else if (string.Equals(trimmedTarget, "SystemAll", StringComparison.OrdinalIgnoreCase)) {
            targetGroupDisplay = "SystemAll";
        } else {
            throw new AppException(
                AppErrorKind.Validation,
                AdminErrorCodes.NotificationInvalidTargetRole,
                $"Invalid target '{trimmedTarget}'. Allowed values: SystemAll, Candidate, Recruiter.",
                [new AppErrorDetail("target", ValidationReasons.NotAllowed, "Đối tượng nhận thông báo không hợp lệ. Chỉ chấp nhận: SystemAll, Candidate, Recruiter.")]);
        }

        // 1. Lấy danh sách tài khoản active theo role mục tiêu
        var userIds = await _userRepository.GetActiveUserIdsByRoleAsync(roleFilter, cancellationToken);

        // 2. Lưu vào bảng Notifications để người dùng thấy trong chuông thông báo
        if (userIds.Count > 0) {
            var notifications = userIds.Select(userId => Notification.Create(
                recipientId: userId,
                type: NotificationType.SystemAlert,
                title: trimmedTitle,
                body: trimmedBody,
                payload: payloadJson,
                resourceType: "System",
                resourceId: null,
                now: now
            )).ToList();

            await _notificationRepository.AddRangeAsync(notifications, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // 3. Phát SignalR realtime qua Group tới các client đang online
        var dto = new NotificationDto(
            Id: Guid.NewGuid(),
            RecipientId: Guid.Empty,
            Type: NotificationType.SystemAlert.ToString(),
            Title: trimmedTitle,
            Body: trimmedBody,
            Payload: payloadElement,
            ResourceType: "System",
            ResourceId: null,
            CreatedAt: now,
            ReadAt: null,
            ExpiresAt: null,
            IsRead: false
        );

        if (roleFilter == "Candidate") {
            await _notificationDispatcher.DispatchToRoleAsync("candidate", dto, cancellationToken);
        } else if (roleFilter == "Recruiter") {
            await _notificationDispatcher.DispatchToRoleAsync("recruiter", dto, cancellationToken);
        } else {
            await _notificationDispatcher.DispatchBroadcastAsync(dto, cancellationToken);
        }

        return Ok(_responseFactory.Success(new {
            target = targetGroupDisplay,
            level = alertLevel,
            title = trimmedTitle,
            recipientCount = userIds.Count,
            sentAt = now,
            message = "Thông báo hệ thống đã được phát và lưu vào hệ thống thành công."
        }));
    }
}

