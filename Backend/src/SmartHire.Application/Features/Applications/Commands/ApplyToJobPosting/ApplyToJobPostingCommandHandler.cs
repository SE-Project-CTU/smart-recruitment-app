using System.Text.Json;
using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Ai.Matching;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Application.Features.Applications.Exceptions;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Commands.ApplyToJobPosting;

public sealed class ApplyToJobPostingCommandHandler : IRequestHandler<ApplyToJobPostingCommand, ApplyJobResult> {
    private const long MaximumCvSizeBytes = 5 * 1024 * 1024;
    private const string PdfContentType = "application/pdf";

    private readonly ICurrentUser _currentUser;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IAiMatchResultRepository _aiMatchResultRepository;
    private readonly ICvEmbeddingRepository _cvEmbeddingRepository;
    private readonly IJobEmbeddingRepository _jobEmbeddingRepository;
    private readonly ISmartHireMatchEngine _matchEngine;
    private readonly IUnitOfWork _unitOfWork;

    public ApplyToJobPostingCommandHandler(
        ICurrentUser currentUser,
        IJobPostingRepository jobPostingRepository,
        IJobApplicationRepository applicationRepository,
        ICvVersionRepository cvVersionRepository,
        IMediaFileRepository mediaFileRepository,
        IAiMatchResultRepository aiMatchResultRepository,
        ICvEmbeddingRepository cvEmbeddingRepository,
        IJobEmbeddingRepository jobEmbeddingRepository,
        ISmartHireMatchEngine matchEngine,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _jobPostingRepository = jobPostingRepository;
        _applicationRepository = applicationRepository;
        _cvVersionRepository = cvVersionRepository;
        _mediaFileRepository = mediaFileRepository;
        _aiMatchResultRepository = aiMatchResultRepository;
        _cvEmbeddingRepository = cvEmbeddingRepository;
        _jobEmbeddingRepository = jobEmbeddingRepository;
        _matchEngine = matchEngine;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApplyJobResult> Handle(
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
        CvVersion? cvVersion = null;
        if (request.CvVersionId is Guid cvVersionId) {
            cvVersion = await _cvVersionRepository.GetByVersionIdAsync(cvVersionId, cancellationToken);
            if (cvVersion is null || !await _cvVersionRepository.IsOwnedByCandidateAsync(cvVersionId, candidateId, cancellationToken)) {
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

                if (request.CvVersionId is Guid cvVerId && cvVersion?.Content is not null) {
                    var jobDetail = await _jobPostingRepository.GetDetailByIdAsync(jobPostingId, ct);
                    if (jobDetail is not null) {
                        decimal? semanticVectorSimilarity = null;
                        try {
                            var cvEmb = await _cvEmbeddingRepository.GetByCvVersionIdAsync(cvVerId, ct);
                            var jobEmb = await _jobEmbeddingRepository.GetByJobIdAsync(jobPostingId, ct);
                            if (cvEmb?.Embedding != null && jobEmb?.Embedding != null) {
                                semanticVectorSimilarity = TryComputeCosineSimilarity(cvEmb.Embedding, jobEmb.Embedding);
                            }
                        } catch {
                            // Graceful degradation: nếu chưa có vector, Match Engine vẫn chạy chuẩn xác theo Lexical + Fuzzy
                        }

                        var matchResult = _matchEngine.Evaluate(
                            cvVersion.Content,
                            jobDetail,
                            semanticVectorSimilarity: semanticVectorSimilarity);

                        var analysisJson = JsonSerializer.Serialize(new {
                            matchResult.Score,
                            matchResult.Breakdown,
                            matchResult.MatchingSkills,
                            matchResult.MissingSkills,
                            matchResult.Summary
                        });
                        var aiMatchResult = AiMatchResult.Create(
                            application.Id,
                            cvVerId,
                            (decimal)matchResult.Score,
                            analysisJson,
                            now);
                        await _aiMatchResultRepository.AddAsync(aiMatchResult, ct);
                    }
                }

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

        return new ApplyJobResult(
            application.Id,
            application.JobId,
            application.CvVersionId,
            uploadedCv?.FileUrl,
            application.CoverLetter,
            "SUBMITTED",
            application.AppliedAt,
            application.UpdatedAt);
    }

    private static decimal? TryComputeCosineSimilarity(Pgvector.Vector v1, Pgvector.Vector v2) {
        var a = v1.ToArray();
        var b = v2.ToArray();
        if (a.Length != b.Length || a.Length == 0) return null;
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.Length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        double denom = Math.Sqrt(normA) * Math.Sqrt(normB);
        if (denom <= 0) return null;
        return (decimal)Math.Clamp(dot / denom, 0.0, 1.0);
    }
}
