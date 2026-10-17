using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Notifications.Exceptions;

namespace SmartHire.Application.Features.Notifications.Commands.DeleteNotification;

public sealed record DeleteNotificationCommand(Guid Id) : IRequest;

public sealed class DeleteNotificationCommandHandler : IRequestHandler<DeleteNotificationCommand> {
    private readonly ICurrentUser _currentUser;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteNotificationCommandHandler(
        ICurrentUser currentUser,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteNotificationCommand request, CancellationToken cancellationToken) {
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

        _notificationRepository.Delete(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
