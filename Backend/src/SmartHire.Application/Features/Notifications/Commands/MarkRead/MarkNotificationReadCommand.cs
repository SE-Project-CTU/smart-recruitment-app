using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Notifications.Exceptions;

namespace SmartHire.Application.Features.Notifications.Commands.MarkRead;

public sealed record MarkNotificationReadCommand(Guid Id) : IRequest;

public sealed class MarkNotificationReadCommandHandler : IRequestHandler<MarkNotificationReadCommand> {
    private readonly ICurrentUser _currentUser;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MarkNotificationReadCommandHandler(
        ICurrentUser currentUser,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw NotificationExceptions.InvalidAccessToken();
        }

        var notification = await _notificationRepository.GetByIdAsync(request.Id, cancellationToken);
        if (notification is null) {
            throw NotificationExceptions.NotificationNotFound();
        }

        if (notification.RecipientId != userId) {
            throw NotificationExceptions.NotificationForbidden();
        }

        notification.MarkAsRead();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
