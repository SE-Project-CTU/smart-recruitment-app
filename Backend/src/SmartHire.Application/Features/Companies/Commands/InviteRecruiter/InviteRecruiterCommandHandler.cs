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

namespace SmartHire.Application.Features.Companies.Commands.InviteRecruiter;

public sealed class InviteRecruiterCommandHandler : IRequestHandler<InviteRecruiterCommand, CompanyInvitationResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationDispatcher? _notificationDispatcher;
    private readonly IUnitOfWork _unitOfWork;

    public InviteRecruiterCommandHandler(
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

    public async Task<CompanyInvitationResult> Handle(InviteRecruiterCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.");
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                CompanyErrorCodes.CompanyNotFound,
                "Company not found.");
        }

        // Caller phải là Owner Active
        var ownerMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (ownerMembership is null || ownerMembership.Role != CompanyMemberRole.Owner || ownerMembership.Status != CompanyMembershipStatus.Active) {
            throw new AppException(
                AppErrorKind.Forbidden,
                CompanyErrorCodes.CompanyForbidden,
                "Only an active Company Owner can send invitations.");
        }

        // Kiểm tra Invitee tồn tại
        var invitee = await _userRepository.GetByIdAsync(request.InviteeId, cancellationToken);
        if (invitee is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                CompanyErrorCodes.UserNotFound,
                "Invitee user not found.");
        }

        // Invitee đã là thành viên của công ty
        var existingMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, request.InviteeId, cancellationToken);
        if (existingMembership is not null && existingMembership.Status == CompanyMembershipStatus.Active) {
            throw new AppException(
                AppErrorKind.Conflict,
                CompanyErrorCodes.CompanyMembershipAlreadyExists,
                "User is already an active member of this company.");
        }

        // Không được có invitation Pending nào trước đó
        var pendingInvitation = await _companyRepository.GetPendingInvitationAsync(request.CompanyId, request.InviteeId, cancellationToken);
        if (pendingInvitation is not null) {
            throw new AppException(
                AppErrorKind.Conflict,
                CompanyErrorCodes.CompanyInvitationAlreadyExists,
                "A pending invitation already exists for this user.");
        }

        var now = DateTimeOffset.UtcNow;
        var expiresAt = request.ExpiresAt ?? now.AddDays(7);
        if (expiresAt <= now) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "Expiration date must be in the future.");
        }

        var invitation = CompanyInvitation.Create(
            companyId: request.CompanyId,
            inviterId: userId,
            inviteeId: request.InviteeId,
            expiresAt: expiresAt,
            now: now);

        await _companyRepository.AddInvitationAsync(invitation, cancellationToken);

        var inviter = await _userRepository.GetByIdAsync(userId, cancellationToken);
        var inviterName = inviter?.FullName ?? "Chủ doanh nghiệp";
        var payloadObj = new {
            company_id = company.Id,
            company_name = company.Name,
            invitation_status = "Pending"
        };
        var payloadJson = JsonSerializer.Serialize(payloadObj);

        var notification = Notification.Create(
            recipientId: request.InviteeId,
            type: NotificationType.CompanyInvitation,
            title: "Lời mời gia nhập công ty",
            body: $"{inviterName} đã mời bạn gia nhập công ty {company.Name}.",
            payload: payloadJson,
            resourceType: "CompanyInvitation",
            resourceId: invitation.Id,
            expiresAt: invitation.ExpiresAt,
            now: now);

        await _notificationRepository.AddAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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

            await _notificationDispatcher.DispatchAsync(notification.RecipientId, notificationDto, cancellationToken);
        }

        return new CompanyInvitationResult(
            invitation.Id,
            invitation.CompanyId,
            invitation.InviterId,
            invitation.InviteeId,
            invitation.Status.ToString(),
            invitation.ExpiresAt,
            invitation.CreatedAt,
            new CompanyBriefSummary(company.Id, company.Name, company.VerificationStatus.ToString()));
    }
}
