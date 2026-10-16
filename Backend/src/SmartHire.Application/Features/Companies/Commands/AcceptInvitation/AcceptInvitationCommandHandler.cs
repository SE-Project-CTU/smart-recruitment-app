using System.Text.Json;
using MediatR;
using SmartHire.Application.Abstractions.Notifications;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Notifications.DTOs;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Commands.AcceptInvitation;

public sealed class AcceptInvitationCommandHandler : IRequestHandler<AcceptInvitationCommand, AcceptInvitationResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationDispatcher? _notificationDispatcher;
    private readonly IUnitOfWork _unitOfWork;

    public AcceptInvitationCommandHandler(
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

    public async Task<AcceptInvitationResult> Handle(AcceptInvitationCommand request, CancellationToken cancellationToken) {
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

        var existingMembership = await _companyRepository.GetMembershipAsync(invitation.CompanyId, userId, cancellationToken);
        if (existingMembership is not null && existingMembership.Status == CompanyMembershipStatus.Active) {
            throw new AppException(
                AppErrorKind.Conflict,
                CompanyErrorCodes.CompanyMembershipAlreadyExists,
                "You are already an active member of this company.");
        }

        return await _unitOfWork.ExecuteInTransactionAsync(async ct => {
            invitation.Accept();

            CompanyMembership membership;
            if (existingMembership is not null) {
                existingMembership.UpdateRole(CompanyMemberRole.Recruiter);
                existingMembership.UpdateStatus(CompanyMembershipStatus.Active);
                membership = existingMembership;
            } else {
                membership = CompanyMembership.Create(
                    companyId: invitation.CompanyId,
                    userId: userId,
                    role: CompanyMemberRole.Recruiter,
                    status: CompanyMembershipStatus.Active,
                    joinedAt: now,
                    now: now);
                await _companyRepository.AddMembershipAsync(membership, ct);
            }

            var company = await _companyRepository.GetByIdAsync(invitation.CompanyId, ct);
            var companyName = company?.Name ?? "công ty";
            var inviteeUser = await _userRepository.GetByIdAsync(userId, ct);
            var inviteeName = inviteeUser?.FullName ?? "Ứng viên";

            var payloadObj = new {
                company_id = invitation.CompanyId,
                company_name = companyName,
                invitation_status = "Accepted"
            };
            var payloadJson = JsonSerializer.Serialize(payloadObj);

            var notification = Notification.Create(
                recipientId: invitation.InviterId,
                type: NotificationType.CompanyInvitation,
                title: "Lời mời đã được chấp nhận",
                body: $"{inviteeName} đã chấp nhận lời mời gia nhập công ty {companyName}.",
                payload: payloadJson,
                resourceType: "CompanyInvitation",
                resourceId: invitation.Id,
                now: now);

            await _notificationRepository.AddAsync(notification, ct);
            await _unitOfWork.SaveChangesAsync(ct);

            if (_notificationDispatcher is not null) {
                var notificationDto = new NotificationDto(
                    notification.Id,
                    notification.RecipientId,
                    notification.Type.ToString(),
                    notification.Title,
                    notification.Body,
                    notification.Payload,
                    notification.ResourceType,
                    notification.ResourceId,
                    notification.CreatedAt,
                    notification.ReadAt,
                    notification.ExpiresAt,
                    notification.IsRead);

                await _notificationDispatcher.DispatchAsync(notification.RecipientId, notificationDto, ct);
            }

            return new AcceptInvitationResult(
                invitation.Id,
                invitation.Status.ToString(),
                new AcceptInvitationMembershipResult(
                    membership.Id,
                    membership.CompanyId,
                    membership.UserId,
                    membership.Role.ToString(),
                    membership.Status.ToString(),
                    membership.JoinedAt));
        }, cancellationToken);
    }
}
