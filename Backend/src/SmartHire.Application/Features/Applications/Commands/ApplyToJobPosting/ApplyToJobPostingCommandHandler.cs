using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Application.Features.Applications.Exceptions;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Commands.ApplyToJobPosting;

public sealed class ApplyToJobPostingCommandHandler : IRequestHandler<ApplyToJobPostingCommand, JobApplicationResult> {
    private const long MaximumCvSizeBytes = 5 * 1024 * 1024;
    private const string PdfContentType = "application/pdf";

    private readonly ICurrentUser _currentUser;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ApplyToJobPostingCommandHandler(
        ICurrentUser currentUser,
        IJobPostingRepository jobPostingRepository,
        IJobApplicationRepository applicationRepository,
        ICvVersionRepository cvVersionRepository,
        IMediaFileRepository mediaFileRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _jobPostingRepository = jobPostingRepository;
        _applicationRepository = applicationRepository;
        _cvVersionRepository = cvVersionRepository;
        _mediaFileRepository = mediaFileRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<JobApplicationResult> Handle(
        ApplyToJobPostingCommand request,
        CancellationToken cancellationToken) {
        var candidateId = _currentUser.UserId
            ?? throw new AppException(AppErrorKind.Unauthorized, AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user ID.");
        var jobPostingId = ApplyToJobPostingCommandValidator.Validate(request);
        var now = DateTimeOffset.UtcNow;

        var posting = await _jobPostingRepository.GetForApplicationByIdAsync(jobPostingId, cancellationToken)
            ?? throw ApplicationExceptions.JobNotFound(jobPostingId);

        if (posting.Status != JobPostingStatus.Published ||
            posting.Company.VerificationStatus != CompanyVerificationStatus.Verified ||
            (posting.Deadline is not null && posting.Deadline <= now)) {
            throw ApplicationExceptions.JobNotAcceptingApplications();
        }

        if (await _applicationRepository.ExistsForCandidateAsync(jobPostingId, candidateId, cancellationToken)) {
            throw ApplicationExceptions.DuplicateApplication();
        }

        MediaFile? uploadedCv = null;
        if (request.CvVersionId is Guid cvVersionId) {
            if (!await _cvVersionRepository.IsOwnedByCandidateAsync(cvVersionId, candidateId, cancellationToken)) {
                throw ApplicationExceptions.CvVersionNotFound();
            }
        } else if (request.UploadedCvFileId is Guid fileId) {
            uploadedCv = await _mediaFileRepository.GetByIdAsync(fileId, cancellationToken)
                ?? throw ApplicationExceptions.UploadedCvNotFound();
            if (uploadedCv.OwnerId != candidateId) throw ApplicationExceptions.UploadedCvNotFound();
            if (!string.Equals(uploadedCv.FileType, PdfContentType, StringComparison.OrdinalIgnoreCase)) {
                throw ApplicationExceptions.UploadedCvNotPdf();
            }
            if (uploadedCv.FileSize > MaximumCvSizeBytes) {
                throw ApplicationExceptions.UploadedCvTooLarge(MaximumCvSizeBytes);
            }
            if (await _applicationRepository.IsUploadedCvFileInUseAsync(fileId, cancellationToken)) {
                throw ApplicationExceptions.UploadedCvAlreadyUsed();
            }
        }

        var application = JobApplication.Create(
            jobPostingId,
            candidateId,
            request.CvVersionId,
            request.UploadedCvFileId,
            request.CoverLetter,
            now);
        var initialHistory = ApplicationStatusHistory.Create(application, candidateId, null, now);
        application.StatusHistories.Add(initialHistory);

        try {
            await _unitOfWork.ExecuteInTransactionAsync(async ct => {
                await _applicationRepository.AddAsync(application, ct);
                await _unitOfWork.SaveChangesAsync(ct);
                return true;
            }, cancellationToken);
        }
        catch (PersistenceUniqueConstraintViolationException exception) when (
            string.Equals(
                exception.ConstraintName,
                "ix_applications_candidate_id_job_id",
                StringComparison.OrdinalIgnoreCase)) {
            throw ApplicationExceptions.DuplicateApplication();
        }

        return new JobApplicationResult(
            application.Id,
            application.JobId,
            application.CandidateId,
            application.CvVersionId,
            uploadedCv?.FileUrl,
            application.CoverLetter,
            "SUBMITTED",
            application.AppliedAt,
            application.UpdatedAt);
    }
}
