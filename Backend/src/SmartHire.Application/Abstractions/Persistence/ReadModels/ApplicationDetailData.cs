using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence.ReadModels;

public sealed record ApplicationDetailData(
    Guid Id,
    Guid JobId,
    ApplicationJobSummaryData Job,
    ApplicationCandidateData Candidate,
    Guid CompanyId,
    Guid? CvVersionId,
    CvVersion? CvVersion,
    string? UploadedCvUrl,
    string CoverLetter,
    ApplicationStatus Status,
    DateTimeOffset AppliedAt,
    DateTimeOffset UpdatedAt);
