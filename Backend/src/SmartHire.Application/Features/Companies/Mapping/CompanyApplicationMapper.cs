using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Application.Features.Applications.Mapping;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Mapping;

internal static class CompanyApplicationMapper {
    public static CompanyApplicationListItemResult ToResult(CompanyApplicationListItemData row) => new(
        row.Id,
        row.JobId,
        row.JobTitle,
        row.CompanyId,
        row.CompanyName,
        new ApplicationCompanySummaryResult(
            row.CompanyId,
            row.CompanyName,
            row.CompanyLogoUrl),
        new ApplicationCandidateResult(
            row.Candidate.Id,
            row.Candidate.FullName,
            row.Candidate.Email,
            row.Candidate.Phone,
            row.Candidate.AvatarUrl),
        row.CvVersionId,
        row.UploadedCvUrl,
        row.CoverLetter,
        ApplicationStatusContract.ToApiValue(row.Status),
        row.AppliedAt,
        row.UpdatedAt);
}
