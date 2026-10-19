using System.Text.Json;
using MediatR;
using SmartHire.Application.Abstractions.Notifications;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Notifications.DTOs;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Commands.ReviewJoinRequest;

public sealed class ReviewJoinRequestCommandHandler : IRequestHandler<ReviewJoinRequestCommand, ReviewJoinRequestResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationDispatcher? _notificationDispatcher;
    private readonly IUnitOfWork _unitOfWork;

    public ReviewJoinRequestCommandHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        INotificationDispatcher? notificationDispatcher = null) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _notificationDispatcher = notificationDispatcher;
    }

    public async Task<ReviewJoinRequestResult> Handle(ReviewJoinRequestCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.");
        }

        var normalizedStatus = request.Status?.Trim().ToUpperInvariant();
        if (normalizedStatus is not ("APPROVED" or "REJECTED")) {
            throw CompanyExceptions.Validation(
                "Status must be either 'APPROVED' or 'REJECTED'.",
                [new AppErrorDetail("status", ValidationReasons.InvalidFormat, "Status must be either 'APPROVED' or 'REJECTED'.")]);
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                CompanyErrorCodes.CompanyNotFound,
                "Company not found.");
        }

        // Caller phải là Owner
        var ownerMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (ownerMembership is null || ownerMembership.Role != CompanyMemberRole.Owner || ownerMembership.Status != CompanyMembershipStatus.Active) {
            throw new AppException(
                AppErrorKind.Forbidden,
                CompanyErrorCodes.CompanyForbidden,
                "Only an active Company Owner can review join requests.");
        }

        var joinRequest = await _companyRepository.GetJoinRequestByIdAsync(request.RequestId, cancellationToken);
        if (joinRequest is null || joinRequest.CompanyId != request.CompanyId) {
            throw new AppException(
                AppErrorKind.NotFound,
                CompanyErrorCodes.CompanyJoinRequestNotFound,
                "Join request not found for this company.");
        }

        if (joinRequest.Status != CompanyJoinRequestStatus.Pending) {
            throw new AppException(
                AppErrorKind.Conflict,
                CompanyErrorCodes.CompanyJoinRequestAlreadyProcessed,
                "This join request has already been processed.");
        }

        var now = DateTimeOffset.UtcNow;

        return await _unitOfWork.ExecuteInTransactionAsync(async ct => {
            AcceptInvitationMembershipResult? membershipResult = null;
            var isApproved = normalizedStatus == "APPROVED";

            if (isApproved) {
                joinRequest.Approve(userId, now);

                var existingMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, joinRequest.UserId, ct);
                CompanyMembership membership;
                if (existingMembership is not null) {
                    existingMembership.UpdateRole(CompanyMemberRole.Recruiter);
                    existingMembership.UpdateStatus(CompanyMembershipStatus.Active);
                    membership = existingMembership;
                } else {
                    membership = CompanyMembership.Create(
                        companyId: request.CompanyId,
                        userId: joinRequest.UserId,
                        role: CompanyMemberRole.Recruiter,
                        status: CompanyMembershipStatus.Active,
                        joinedAt: now,
                        now: now);
                    await _companyRepository.AddMembershipAsync(membership, ct);
                }

                membershipResult = new AcceptInvitationMembershipResult(
                    membership.Id,
                    membership.CompanyId,
                    membership.UserId,
                    membership.Role.ToString(),
                    membership.Status.ToString(),
                    membership.JoinedAt);
            } else {
                joinRequest.Reject(userId, now);
            }

            var payloadObj = new {
                company_id = company.Id,
                company_name = company.Name,
                applicant_id = joinRequest.UserId,
                request_status = normalizedStatus
            };
            var payloadJson = JsonSerializer.Serialize(payloadObj);

            var notification = Notification.Create(
                recipientId: joinRequest.UserId,
                type: NotificationType.CompanyJoinRequest,
                title: isApproved ? "Yêu cầu gia nhập đã được duyệt" : "Yêu cầu gia nhập bị từ chối",
                body: isApproved
                    ? $"Yêu cầu gia nhập công ty {company.Name} của bạn đã được chấp thuận."
                    : $"Yêu cầu gia nhập công ty {company.Name} của bạn đã bị từ chối.",
                payload: payloadJson,
                resourceType: "CompanyJoinRequest",
                resourceId: joinRequest.Id,
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

            return new ReviewJoinRequestResult(
                joinRequest.Id,
                joinRequest.CompanyId,
                normalizedStatus,
                joinRequest.ReviewedBy,
                joinRequest.ReviewedAt,
                membershipResult);
        }, cancellationToken);
    }
}
