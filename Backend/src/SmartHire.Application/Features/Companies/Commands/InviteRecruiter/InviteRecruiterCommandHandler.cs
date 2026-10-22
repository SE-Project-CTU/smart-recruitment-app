using System.Text.Json;
using MediatR;
using SmartHire.Application.Abstractions.Notifications;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Companies.Mapping;
using SmartHire.Application.Features.Notifications.Mapping;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Commands.InviteRecruiter;

public sealed class InviteRecruiterCommandHandler : IRequestHandler<InviteRecruiterCommand, CompanyInvitationResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUserRoleRepository _userRoleRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationDispatcher? _notificationDispatcher;
    private readonly IUnitOfWork _unitOfWork;

    public InviteRecruiterCommandHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository,
        IUserRepository userRepository,
        IUserRoleRepository userRoleRepository,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        INotificationDispatcher? notificationDispatcher = null) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
        _userRepository = userRepository;
        _userRoleRepository = userRoleRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _notificationDispatcher = notificationDispatcher;
    }

    public async Task<CompanyInvitationResult> Handle(InviteRecruiterCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw CompanyExceptions.InvalidAccessToken();
        }

        if (request.InviteeId == Guid.Empty) {
            throw CompanyExceptions.Validation("Invitee id is required.", [new AppErrorDetail("inviteeId", ValidationReasons.Required, "Invitee id must be a valid UUID.")]);
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        // Caller phải là Owner Active
        var ownerMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (ownerMembership is null || ownerMembership.Role != CompanyMemberRole.Owner || ownerMembership.Status != CompanyMembershipStatus.Active) {
            throw CompanyExceptions.CompanyForbidden("Only an active Company Owner can send invitations.");
        }

        // Kiểm tra Invitee tồn tại
        var invitee = await _userRepository.GetByIdAsync(request.InviteeId, cancellationToken);
        if (invitee is null) {
            throw CompanyExceptions.UserNotFound("inviteeId");
        }

        // Kiểm tra Invitee phải có role Recruiter (Spec: 422 Unprocessable Entity)
        var inviteeRoles = await _userRoleRepository.GetAllByUserIdAsync(request.InviteeId, cancellationToken);
        if (inviteeRoles.All(r => r.Role.Name != RoleNames.Recruiter)) {
            throw CompanyExceptions.InviteeRoleRequired();
        }

        // Invitee đã là thành viên của công ty
        var existingMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, request.InviteeId, cancellationToken);
        if (existingMembership is not null && existingMembership.Status == CompanyMembershipStatus.Active) {
            throw CompanyExceptions.CompanyMembershipAlreadyExists();
        }

        // Không được có invitation Pending nào trước đó
        var pendingInvitation = await _companyRepository.GetPendingInvitationAsync(request.CompanyId, request.InviteeId, cancellationToken);
        if (pendingInvitation is not null) {
            throw CompanyExceptions.CompanyInvitationAlreadyExists();
        }

        var now = DateTimeOffset.UtcNow;
        var expiresAt = (request.ExpiresAt ?? now.AddDays(7)).ToUniversalTime();
        if (expiresAt <= now) {
            throw CompanyExceptions.Validation(
                "Expiration date must be in the future.",
                [new AppErrorDetail("expiresAt", ValidationReasons.InvalidFormat, "Expiration date must be in the future.")]);
        }

        var inviter = await _userRepository.GetByIdAsync(userId, cancellationToken);
        var inviterName = inviter?.FullName ?? "Chủ doanh nghiệp";

        return await _unitOfWork.ExecuteInTransactionAsync(async cancellationToken => {
            var invitation = CompanyInvitation.Create(
                companyId: request.CompanyId,
                inviterId: userId,
                inviteeId: request.InviteeId,
                expiresAt: expiresAt,
                now: now);

            await _companyRepository.AddInvitationAsync(invitation, cancellationToken);

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
                var notificationDto = NotificationResultMapper.ToDto(notification);
                await _notificationDispatcher.DispatchAsync(notification.RecipientId, notificationDto, cancellationToken);
            }

            return CompanyResultMapper.ToCompanyInvitationResult(invitation, company);
        }, cancellationToken);
    }
}
