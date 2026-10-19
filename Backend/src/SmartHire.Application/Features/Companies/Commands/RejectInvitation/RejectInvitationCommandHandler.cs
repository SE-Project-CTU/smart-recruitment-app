using System.Text.Json;
using MediatR;
using SmartHire.Application.Abstractions.Notifications;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Notifications.Mapping;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Commands.RejectInvitation;

public sealed class RejectInvitationCommandHandler : IRequestHandler<RejectInvitationCommand> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationDispatcher? _notificationDispatcher;
    private readonly IUnitOfWork _unitOfWork;

    public RejectInvitationCommandHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository,
        IUserRepository userRepository,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        INotificationDispatcher? notificationDispatcher = null) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
        _userRepository = userRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _notificationDispatcher = notificationDispatcher;
    }

    public async Task Handle(RejectInvitationCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.");
        }

        var invitation = await _companyRepository.GetInvitationByIdAsync(request.InvitationId, cancellationToken);
        if (invitation is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                CompanyErrorCodes.CompanyInvitationNotFound,
                "Company invitation not found.");
        }

        if (invitation.InviteeId != userId) {
            throw new AppException(
                AppErrorKind.Forbidden,
                CompanyErrorCodes.CompanyForbidden,
                "You are not the invitee of this invitation.");
        }

        var now = DateTimeOffset.UtcNow;
        if (invitation.Status != CompanyInvitationStatus.Pending) {
            throw new AppException(
                AppErrorKind.Conflict,
                CompanyErrorCodes.CompanyInvitationAlreadyProcessed,
                "This invitation has already been processed.");
        }

        if (invitation.ExpiresAt <= now) {
            invitation.Expire();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            throw new AppException(
                AppErrorKind.BadRequest,
                CompanyErrorCodes.CompanyInvitationExpired,
                "This invitation has expired.");
        }

        invitation.Reject();

        var company = await _companyRepository.GetByIdAsync(invitation.CompanyId, cancellationToken);
        var companyName = company?.Name ?? "công ty";
        var inviteeUser = await _userRepository.GetByIdAsync(userId, cancellationToken);
        var inviteeName = inviteeUser?.FullName ?? "Ứng viên";

        var payloadObj = new {
            company_id = invitation.CompanyId,
            company_name = companyName,
            invitation_status = "Rejected"
        };
        var payloadJson = JsonSerializer.Serialize(payloadObj);

        var notification = Notification.Create(
            recipientId: invitation.InviterId,
            type: NotificationType.CompanyInvitation,
            title: "Lời mời bị từ chối",
            body: $"{inviteeName} đã từ chối lời mời gia nhập công ty {companyName}.",
            payload: payloadJson,
            resourceType: "CompanyInvitation",
            resourceId: invitation.Id,
            now: now);

        await _notificationRepository.AddAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (_notificationDispatcher is not null) {
            var notificationDto = NotificationResultMapper.ToDto(notification);

            await _notificationDispatcher.DispatchAsync(notification.RecipientId, notificationDto, cancellationToken);
        }
    }
}
