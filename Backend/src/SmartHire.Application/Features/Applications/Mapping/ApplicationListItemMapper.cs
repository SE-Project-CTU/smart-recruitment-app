using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Applications.DTOs;

namespace SmartHire.Application.Features.Applications.Mapping;

internal static class ApplicationListItemMapper {
    public static JobApplicationListItemResult ToJobApplicationResult(JobApplicationListItemData row) => new(
        row.Id,
        row.JobId,
        new ApplicationCandidateResult(
            row.Candidate.Id,
            row.Candidate.FullName,
            row.Candidate.Email,
            row.Candidate.AvatarUrl),
        row.CvVersionId,
        row.UploadedCvUrl,
        row.CoverLetter,
        ApplicationStatusContract.ToApiValue(row.Status),
        row.AppliedAt,
        row.UpdatedAt);

    public static MyApplicationListItemResult ToMyApplicationResult(MyApplicationListItemData row) => new(
        row.Id,
        row.JobId,
        row.CvVersionId,
        row.UploadedCvUrl,
        row.CoverLetter,
        ApplicationStatusContract.ToApiValue(row.Status),
        row.AppliedAt,
        row.UpdatedAt);
}
