using MediatR;
using Microsoft.Extensions.Logging;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.JobPostings.DTOs;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Commands.UpdateJobPostingStatus;

public sealed class UpdateJobPostingStatusCommandHandler
    : IRequestHandler<UpdateJobPostingStatusCommand, UpdateJobPostingStatusResult>
{
    private readonly ICurrentUser _currentUser;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateJobPostingStatusCommandHandler> _logger;

    public UpdateJobPostingStatusCommandHandler(
        ICurrentUser currentUser,
        IJobPostingRepository jobPostingRepository,
        ICompanyRepository companyRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateJobPostingStatusCommandHandler> logger)
    {
        _currentUser = currentUser;
        _jobPostingRepository = jobPostingRepository;
        _companyRepository = companyRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<UpdateJobPostingStatusResult> Handle(
        UpdateJobPostingStatusCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw JobPostingExceptions.InvalidAccessToken();

        var isRecruiter = _currentUser.Roles.Contains(RoleNames.Recruiter);
        if (!isRecruiter)
        {
            throw JobPostingExceptions.JobPostingForbidden();
        }

        var (jobId, targetStatus) = UpdateJobPostingStatusCommandValidator.Validate(request);

        var posting = await _jobPostingRepository.GetForUpdateByIdAsync(jobId, cancellationToken)
            ?? throw JobPostingExceptions.JobPostingNotFound(jobId);

        // Authorization check: User must be an Active member of the posting's company
        var membership = await _companyRepository.GetMembershipAsync(
            posting.CompanyId, userId, cancellationToken);

        if (membership is null || membership.Status != CompanyMembershipStatus.Active)
        {
            throw JobPostingExceptions.JobPostingForbidden();
        }

        // Conflict check: Already Closed or Expired postings cannot be closed again
        if (posting.Status == JobPostingStatus.Closed || posting.Status == JobPostingStatus.Expired)
        {
            throw JobPostingExceptions.JobPostingConflict(
                $"Job posting is already in '{posting.Status}' status and cannot be updated.");
        }

        var now = DateTimeOffset.UtcNow;
        if (targetStatus == JobPostingStatus.Closed)
        {
            posting.Close(now);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Job posting {JobPostingId} status updated to {Status} by user {UserId}",
            posting.Id, posting.Status, userId);

        return new UpdateJobPostingStatusResult(
            posting.Id,
            "CLOSED",
            posting.UpdatedAt);
    }
}
