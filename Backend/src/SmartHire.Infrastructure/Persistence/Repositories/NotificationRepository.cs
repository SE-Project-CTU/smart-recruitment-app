using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class NotificationRepository : INotificationRepository {
    private readonly SmartHireDbContext _context;

    public NotificationRepository(SmartHireDbContext context) {
        _context = context;
    }

    public async Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken) {
        return await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Notification>> GetByIdsAsync(
        IReadOnlyCollection<Guid> ids,
        CancellationToken cancellationToken) {
        if (ids.Count == 0) {
            return Array.Empty<Notification>();
        }

        return await _context.Notifications
            .AsNoTracking()
            .Where(notification => ids.Contains(notification.Id))
            .OrderBy(notification => notification.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Notification notification, CancellationToken cancellationToken) {
        await _context.Notifications.AddAsync(notification, cancellationToken);
    }

    public async Task AddRangeAsync(
        IReadOnlyCollection<Notification> notifications,
        CancellationToken cancellationToken) {
        if (notifications.Count == 0) {
            return;
        }

        await _context.Notifications.AddRangeAsync(notifications, cancellationToken);
    }

    public async Task<(IReadOnlyList<Notification> Items, int TotalCount)> GetByRecipientPagedAsync(
        Guid recipientId,
        NotificationType? type,
        bool? isUnread,
        int page,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = _context.Notifications
            .AsNoTracking()
            .Where(n => n.RecipientId == recipientId);

        if (type.HasValue) {
            query = query.Where(n => n.Type == type.Value);
        }

        if (isUnread.HasValue) {
            query = isUnread.Value
                ? query.Where(n => n.ReadAt == null)
                : query.Where(n => n.ReadAt != null);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<int> GetUnreadCountAsync(Guid recipientId, CancellationToken cancellationToken) {
        return await _context.Notifications
            .Where(n => n.RecipientId == recipientId && n.ReadAt == null)
            .CountAsync(cancellationToken);
    }

    public async Task MarkAllAsReadAsync(Guid recipientId, DateTimeOffset readAt, CancellationToken cancellationToken) {
        await _context.Notifications
            .Where(n => n.RecipientId == recipientId && n.ReadAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.ReadAt, readAt), cancellationToken);
    }

    public void Delete(Notification notification) {
        _context.Notifications.Remove(notification);
    }
}
