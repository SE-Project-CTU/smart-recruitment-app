using SmartHire.Application.Features.Applications.DTOs;

namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record CompanyApplicationListItemResult(
    Guid Id,
    Guid JobId,
    string JobTitle,
    Guid CompanyId,
    string CompanyName,
    ApplicationCompanySummaryResult Company,
    ApplicationCandidateResult Candidate,
    Guid? CvVersionId,
    string? UploadedCvUrl,
    string CoverLetter,
    string Status,
    DateTimeOffset AppliedAt,
    DateTimeOffset UpdatedAt);
