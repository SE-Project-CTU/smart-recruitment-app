using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Application.Features.Admin.JobPostings.DTOs;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.JobPostings.Commands.ReviewJobModeration;

public sealed class ReviewJobModerationCommandHandler
    : IRequestHandler<ReviewJobModerationCommand, ReviewJobModerationResult> {
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ReviewJobModerationCommandHandler(
        IJobPostingRepository jobPostingRepository,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork) {
        _jobPostingRepository = jobPostingRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
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

        return await _unitOfWork.ExecuteInTransactionAsync(async ct => {
            job.Moderate(command.Status, now);

            if (command.Status == JobPostingStatus.Rejected && !string.IsNullOrWhiteSpace(command.RejectionReason)) {
                var notification = Notification.Create(
                    recipientId: job.CreatedBy,
                    type: NotificationType.SystemAlert,
                    title: "Tin tuyển dụng không được duyệt",
                    body: $"Tin tuyển dụng \"{job.Title}\" đã bị từ chối phê duyệt. Lý do: {command.RejectionReason}",
                    resourceType: "JobPosting",
                    resourceId: job.Id,
                    now: now
                );
                await _notificationRepository.AddAsync(notification, ct);
            }

            return new ReviewJobModerationResult(
                job.Id,
                job.Status.ToString().ToUpperInvariant(),
                job.UpdatedAt);
        }, cancellationToken);
    }
}
