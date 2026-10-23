using System.Text.Json;
using MediatR;
using SmartHire.Application.Abstractions.Notifications;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Companies.Mapping;
using SmartHire.Application.Features.Notifications.Mapping;
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
            throw CompanyExceptions.InvalidAccessToken();
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        // Kiểm tra caller đã là member chưa
        var existingMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (existingMembership is not null && existingMembership.Status == CompanyMembershipStatus.Active) {
            throw CompanyExceptions.CompanyMembershipAlreadyExists();
        }

        // Kiểm tra đã có request Pending chưa
        var pendingRequest = await _companyRepository.GetPendingJoinRequestAsync(request.CompanyId, userId, cancellationToken);
        if (pendingRequest is not null) {
            throw CompanyExceptions.CompanyJoinRequestAlreadyExists();
        }

        var now = DateTimeOffset.UtcNow;

        // Đọc dữ liệu cần thiết trước khi vào transaction
        var ownerMembership = await _companyRepository.GetActiveOwnerMembershipAsync(request.CompanyId, cancellationToken);
        var applicant = ownerMembership is not null
            ? await _userRepository.GetByIdAsync(userId, cancellationToken)
            : null;
        var applicantName = applicant?.FullName ?? "Ứng viên";

        var (joinRequest, notification) = await _unitOfWork.ExecuteInTransactionAsync(async cancellationToken => {
            var joinRequest = CompanyJoinRequest.Create(request.CompanyId, userId, now);
            await _companyRepository.AddJoinRequestAsync(joinRequest, cancellationToken);

            // Gửi thông báo đến Owner của công ty (nếu có)
            Notification? notification = null;
            if (ownerMembership is not null) {
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

            return (joinRequest, notification);
        }, cancellationToken);

        if (notification is not null && _notificationDispatcher is not null) {
            try {
                var notificationDto = NotificationResultMapper.ToDto(notification);
                await _notificationDispatcher.DispatchAsync(notification.RecipientId, notificationDto, cancellationToken);
            } catch {
            }
        }

        return CompanyResultMapper.ToCompanyJoinRequestResult(joinRequest);
    }
}
