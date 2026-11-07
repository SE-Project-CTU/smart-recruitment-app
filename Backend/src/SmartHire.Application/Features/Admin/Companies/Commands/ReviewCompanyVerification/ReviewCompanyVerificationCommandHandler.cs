using MediatR;
using SmartHire.Application.Abstractions.Notifications;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Companies.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Application.Features.Notifications.Mapping;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.Companies.Commands.ReviewCompanyVerification;

public sealed class ReviewCompanyVerificationCommandHandler
    : IRequestHandler<ReviewCompanyVerificationCommand, ReviewCompanyVerificationResult> {
    private readonly ICompanyRepository _companyRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationDispatcher? _notificationDispatcher;
    private readonly IUnitOfWork _unitOfWork;

    public ReviewCompanyVerificationCommandHandler(
        ICompanyRepository companyRepository,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        INotificationDispatcher? notificationDispatcher = null) {
        _companyRepository = companyRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _notificationDispatcher = notificationDispatcher;
    }

    public async Task<ReviewCompanyVerificationResult> Handle(
        ReviewCompanyVerificationCommand request,
        CancellationToken cancellationToken) {
        var command = ReviewCompanyVerificationCommandValidator.Validate(request);

        var company = await _companyRepository.GetByIdAsync(command.CompanyId, cancellationToken);
        if (company is null) {
            throw AdminExceptions.CompanyNotFound(command.CompanyId);
        }

        if (company.VerificationStatus == command.Status) {
            throw AdminExceptions.Conflict(
                AdminErrorCodes.CompanyAlreadyVerified,
                $"Company is already in '{company.VerificationStatus}' verification status.",
                "verificationStatus");
        }

        var now = DateTimeOffset.UtcNow;
        DateTimeOffset? verifiedAt = command.Status == CompanyVerificationStatus.Verified ? now : null;

        var (result, notification) = await _unitOfWork.ExecuteInTransactionAsync(async ct => {
            company.SetVerificationStatus(command.Status, verifiedAt, now);

            Notification? createdNotification = null;
            // Gửi notification cho Owner công ty nếu có
            var owner = await _companyRepository.GetActiveOwnerMembershipAsync(company.Id, ct);
            if (owner is not null) {
                var title = command.Status == CompanyVerificationStatus.Verified
                    ? "Doanh nghiệp đã được phê duyệt"
                    : "Yêu cầu xác minh doanh nghiệp bị từ chối";

                var content = command.Status == CompanyVerificationStatus.Verified
                    ? $"Doanh nghiệp {company.Name} đã được quản trị viên phê duyệt thành công."
                    : $"Doanh nghiệp {company.Name} bị từ chối xác minh. Lý do: {command.Reason}";

                createdNotification = Notification.Create(
                    recipientId: owner.UserId,
                    type: NotificationType.SystemAlert,
                    title: title,
                    body: content,
                    resourceType: "Company",
                    resourceId: company.Id,
                    now: now
                );
                await _notificationRepository.AddAsync(createdNotification, ct);
            }

            await _unitOfWork.SaveChangesAsync(ct);

            var verificationResult = new ReviewCompanyVerificationResult(
                company.Id,
                company.VerificationStatus.ToString().ToUpperInvariant(),
                company.VerifiedAt,
                company.UpdatedAt
            );

            return (verificationResult, createdNotification);
        }, cancellationToken);

        if (_notificationDispatcher is not null && notification is not null) {
            try {
                var dto = NotificationResultMapper.ToDto(notification);
                await _notificationDispatcher.DispatchAsync(notification.RecipientId, dto, cancellationToken);
                await _notificationDispatcher.DispatchToCompanyAsync(company.Id, dto, cancellationToken);
            }
            catch {
            }
        }

        return result;
    }
}
