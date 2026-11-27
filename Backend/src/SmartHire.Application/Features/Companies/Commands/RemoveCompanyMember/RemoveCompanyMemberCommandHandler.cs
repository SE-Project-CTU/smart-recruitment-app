using System.Text.Json;
using MediatR;
using SmartHire.Application.Abstractions.Notifications;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Notifications.Mapping;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Commands.RemoveCompanyMember;

public sealed class RemoveCompanyMemberCommandHandler : IRequestHandler<RemoveCompanyMemberCommand> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationDispatcher? _notificationDispatcher;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveCompanyMemberCommandHandler(
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

    public async Task Handle(RemoveCompanyMemberCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw CompanyExceptions.InvalidAccessToken();
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        // Caller phải là active Owner của công ty
        var callerMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (callerMembership is null || callerMembership.Role != CompanyMemberRole.Owner || callerMembership.Status != CompanyMembershipStatus.Active) {
            throw CompanyExceptions.NotCompanyOwner();
        }

        // Tìm membership của thành viên cần xóa (hỗ trợ cả MembershipId lẫn UserId)
        var targetMembership = await _companyRepository.GetMembershipByIdOrUserIdAsync(request.CompanyId, request.MemberId, cancellationToken);
        if (targetMembership is null) {
            throw CompanyExceptions.CompanyMembershipNotFound();
        }

        // Không được xóa Owner (hoặc chính mình)
        if (targetMembership.Role == CompanyMemberRole.Owner || targetMembership.UserId == userId) {
            throw CompanyExceptions.CompanyForbidden("Cannot remove the company owner. Please transfer ownership first.");
        }

        // Nếu thành viên đã rời công ty
        if (targetMembership.Status == CompanyMembershipStatus.Left) {
            return;
        }

        var now = DateTimeOffset.UtcNow;
        targetMembership.UpdateStatus(CompanyMembershipStatus.Left);

        var payloadObj = new {
            company_id = company.Id,
            company_name = company.Name,
            action = "REMOVED_FROM_COMPANY"
        };
        var payloadJson = JsonSerializer.Serialize(payloadObj);

        var notification = Notification.Create(
            recipientId: targetMembership.UserId,
            type: NotificationType.SystemAlert,
            title: "Bạn đã bị thôi việc",
            body: $"Bạn không còn là thành viên của công ty {company.Name}.",
            payload: payloadJson,
            resourceType: "Company",
            resourceId: company.Id,
            now: now);

        await _notificationRepository.AddAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (_notificationDispatcher is not null) {
            try {
                var notificationDto = NotificationResultMapper.ToDto(notification);
                await _notificationDispatcher.DispatchAsync(notification.RecipientId, notificationDto, cancellationToken);
                await _notificationDispatcher.DispatchToCompanyAsync(company.Id, notificationDto, cancellationToken);
            } catch {
            }
        }
    }
}
