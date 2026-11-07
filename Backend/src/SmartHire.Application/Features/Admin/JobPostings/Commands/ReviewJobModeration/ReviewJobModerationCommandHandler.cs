using MediatR;
using SmartHire.Application.Abstractions.Notifications;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Application.Features.Admin.JobPostings.DTOs;
using SmartHire.Application.Features.Notifications.Mapping;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.JobPostings.Commands.ReviewJobModeration;

public sealed class ReviewJobModerationCommandHandler
    : IRequestHandler<ReviewJobModerationCommand, ReviewJobModerationResult> {
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationDispatcher? _notificationDispatcher;
    private readonly IUnitOfWork _unitOfWork;

    public ReviewJobModerationCommandHandler(
        IJobPostingRepository jobPostingRepository,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        INotificationDispatcher? notificationDispatcher = null) {
        _jobPostingRepository = jobPostingRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _notificationDispatcher = notificationDispatcher;
    }

    public async Task<ReviewJobModerationResult> Handle(
        ReviewJobModerationCommand request,
        CancellationToken cancellationToken) {
        var command = ReviewJobModerationCommandValidator.Validate(request);

        var job = await _jobPostingRepository.GetForModerationByIdAsync(command.JobPostingId, cancellationToken);
        if (job is null) {
            throw AdminExceptions.JobPostingNotFound(command.JobPostingId);
        }

        if (job.Status != JobPostingStatus.PendingReview) {
            throw AdminExceptions.Conflict(
                AdminErrorCodes.JobAlreadyModerated,
                $"Job posting is currently in '{job.Status}' status and cannot be moderated.",
                "status");
        }

        if (command.Status == JobPostingStatus.Published &&
            job.Company.VerificationStatus != CompanyVerificationStatus.Verified) {
            throw AdminExceptions.Conflict(
                AdminErrorCodes.CompanyNotVerifiedForJobApproval,
                "Cannot approve or publish job posting because the associated company has not been verified.",
                "companyVerificationStatus");
        }

        var now = DateTimeOffset.UtcNow;

        var (result, notification) = await _unitOfWork.ExecuteInTransactionAsync(async ct => {
            job.Moderate(command.Status, now);

            Notification? createdNotification = null;

            if (command.Status == JobPostingStatus.Published) {
                createdNotification = Notification.Create(
                    recipientId: job.CreatedBy,
                    type: NotificationType.SystemAlert,
                    title: "Tin tuyển dụng đã được phê duyệt",
                    body: $"Tin tuyển dụng \"{job.Title}\" đã được quản trị viên phê duyệt thành công và hiển thị công khai.",
                    resourceType: "JobPosting",
                    resourceId: job.Id,
                    now: now
                );
                await _notificationRepository.AddAsync(createdNotification, ct);
            }
            else if (command.Status == JobPostingStatus.Rejected && !string.IsNullOrWhiteSpace(command.RejectionReason)) {
                createdNotification = Notification.Create(
                    recipientId: job.CreatedBy,
                    type: NotificationType.SystemAlert,
                    title: "Tin tuyển dụng không được duyệt",
                    body: $"Tin tuyển dụng \"{job.Title}\" đã bị từ chối phê duyệt. Lý do: {command.RejectionReason}",
                    resourceType: "JobPosting",
                    resourceId: job.Id,
                    now: now
                );
                await _notificationRepository.AddAsync(createdNotification, ct);
            }

            await _unitOfWork.SaveChangesAsync(ct);

            var moderationResult = new ReviewJobModerationResult(
                job.Id,
                job.Status.ToString().ToUpperInvariant(),
                job.UpdatedAt);

            return (moderationResult, createdNotification);
        }, cancellationToken);

        if (_notificationDispatcher is not null && notification is not null) {
            try {
                var dto = NotificationResultMapper.ToDto(notification);
                await _notificationDispatcher.DispatchAsync(notification.RecipientId, dto, cancellationToken);
                await _notificationDispatcher.DispatchToCompanyAsync(job.CompanyId, dto, cancellationToken);
            }
            catch {
            }
        }

        return result;
    }
}
