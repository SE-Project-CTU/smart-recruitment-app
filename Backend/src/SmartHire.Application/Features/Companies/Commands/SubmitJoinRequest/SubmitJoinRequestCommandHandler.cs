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

namespace SmartHire.Application.Features.Companies.Commands.SubmitJoinRequest;

public sealed class SubmitJoinRequestCommandHandler : IRequestHandler<SubmitJoinRequestCommand, CompanyJoinRequestResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationDispatcher? _notificationDispatcher;
    private readonly IUnitOfWork _unitOfWork;

    public SubmitJoinRequestCommandHandler(
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

    public async Task<CompanyJoinRequestResult> Handle(SubmitJoinRequestCommand request, CancellationToken cancellationToken) {
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

        // Kiểm tra caller đã là member chưa
        var existingMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (existingMembership is not null && existingMembership.Status == CompanyMembershipStatus.Active) {
            throw new AppException(
                AppErrorKind.Conflict,
                CompanyErrorCodes.CompanyMembershipAlreadyExists,
                "You are already an active member of this company.");
        }

        // Kiểm tra đã có request Pending chưa
        var pendingRequest = await _companyRepository.GetPendingJoinRequestAsync(request.CompanyId, userId, cancellationToken);
        if (pendingRequest is not null) {
            throw new AppException(
                AppErrorKind.Conflict,
                CompanyErrorCodes.CompanyJoinRequestAlreadyExists,
                "You already have a pending join request for this company.");
        }

        var now = DateTimeOffset.UtcNow;
        var joinRequest = CompanyJoinRequest.Create(request.CompanyId, userId, now);

        await _companyRepository.AddJoinRequestAsync(joinRequest, cancellationToken);

        // Gửi thông báo đến Owner của công ty
        var ownerMembership = await _companyRepository.GetActiveOwnerMembershipAsync(request.CompanyId, cancellationToken);
        Notification? notification = null;
        if (ownerMembership is not null) {
            var applicant = await _userRepository.GetByIdAsync(userId, cancellationToken);
            var applicantName = applicant?.FullName ?? "Ứng viên";

            var payloadObj = new {
                company_id = company.Id,
                company_name = company.Name,
                applicant_id = userId,
                applicant_name = applicantName,
                request_status = "Pending"
            };
            var payloadJson = JsonSerializer.Serialize(payloadObj);

            notification = Notification.Create(
                recipientId: ownerMembership.UserId,
                type: NotificationType.CompanyJoinRequest,
                title: "Yêu cầu gia nhập công ty mới",
                body: $"{applicantName} đã gửi yêu cầu gia nhập công ty {company.Name}.",
                payload: payloadJson,
                resourceType: "CompanyJoinRequest",
                resourceId: joinRequest.Id,
                now: now);

            await _notificationRepository.AddAsync(notification, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (notification is not null && _notificationDispatcher is not null) {
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

        return new CompanyJoinRequestResult(
            joinRequest.Id,
            joinRequest.CompanyId,
            joinRequest.UserId,
            joinRequest.Status.ToString(),
            joinRequest.CreatedAt);
    }
}
