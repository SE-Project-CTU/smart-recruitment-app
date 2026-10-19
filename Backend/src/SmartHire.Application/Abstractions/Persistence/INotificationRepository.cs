using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence;

public interface INotificationRepository {
    Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task AddAsync(Notification notification, CancellationToken cancellationToken);
    Task AddRangeAsync(IReadOnlyCollection<Notification> notifications, CancellationToken cancellationToken);
    Task<(IReadOnlyList<Notification> Items, int TotalCount)> GetByRecipientPagedAsync(
        Guid recipientId,
        NotificationType? type,
        bool? isUnread,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
    Task<int> GetUnreadCountAsync(Guid recipientId, CancellationToken cancellationToken);
    Task MarkAllAsReadAsync(Guid recipientId, DateTimeOffset readAt, CancellationToken cancellationToken);
    void Delete(Notification notification);
}
