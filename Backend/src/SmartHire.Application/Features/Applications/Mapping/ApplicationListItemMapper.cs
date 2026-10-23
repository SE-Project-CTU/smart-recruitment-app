using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Applications.DTOs;

namespace SmartHire.Application.Features.Applications.Mapping;

internal static class ApplicationListItemMapper {
    public static ApplicationListItemResult ToResult(ApplicationListItemData row) => new(
        row.Id,
        row.JobId,
        row.CandidateId,
        row.CvVersionId,
        row.UploadedCvUrl,
        row.CoverLetter,
        ApplicationStatusContract.ToApiValue(row.Status),
        row.AppliedAt,
        row.UpdatedAt);
}
