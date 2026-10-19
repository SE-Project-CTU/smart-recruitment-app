using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Application.Features.Notifications.Commands.DeleteNotification;
using SmartHire.Application.Features.Notifications.Commands.MarkAllRead;
using SmartHire.Application.Features.Notifications.Commands.MarkRead;
using SmartHire.Application.Features.Notifications.Queries.GetNotifications;
using SmartHire.Application.Features.Notifications.Queries.GetUnreadCount;
using SmartHire.Domain.Enums;

namespace SmartHire.Api.Controllers;

[ApiController]
[Route("api/v1/me/notifications")]
[Authorize]
public sealed class NotificationController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;

    public NotificationController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }

    /// Lấy danh sách thông báo của người dùng hiện tại.
    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] string? type,
        [FromQuery] bool? isUnread,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        NotificationType? parsedType = null;
        if (!string.IsNullOrWhiteSpace(type) && Enum.TryParse<NotificationType>(type, true, out var notifType)) {
            parsedType = notifType;
        }

        var (items, totalCount) = await _sender.Send(
            new GetNotificationsQuery(parsedType, isUnread, page, pageSize),
            cancellationToken);

        return Ok(_responseFactory.Paged(items, page, pageSize, totalCount));
    }

    /// Lấy số lượng thông báo chưa đọc của người dùng hiện tại
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken = default) {
        var result = await _sender.Send(new GetUnreadCountQuery(), cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// Đánh dấu 1 thông báo đã đọc.
    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) {
        await _sender.Send(new MarkNotificationReadCommand(id), cancellationToken);
        return Ok(_responseFactory.Success(new { message = "Notification marked as read." }));
    }

    /// Đánh dấu tất cả thông báo của người dùng hiện tại đã đọc.
    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken = default) {
        await _sender.Send(new MarkAllNotificationsReadCommand(), cancellationToken);
        return Ok(_responseFactory.Success(new { message = "All notifications marked as read." }));
    }

    /// Xóa 1 thông báo của người dùng hiện tại.
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) {
        await _sender.Send(new DeleteNotificationCommand(id), cancellationToken);
        return NoContent();
    }
}
