using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Applications.Mapping;

internal static class UpdateApplicationStatusMapper {
    public static UpdateApplicationStatusResult ToResult(
        JobApplication application,
        ApplicationStatusHistory latestHistory) => new(
        application.Id,
        application.JobId,
        application.CandidateId,
        application.CvVersionId,
        application.UploadedCvFile?.FileUrl,
        application.CoverLetter,
        ApplicationStatusContract.ToApiValue(application.Status),
        application.AppliedAt,
        application.UpdatedAt,
        new ApplicationStatusHistoryResult(
            latestHistory.Id,
            latestHistory.ApplicationId,
            ApplicationStatusContract.ToApiValue(latestHistory.Status),
            latestHistory.ChangedBy,
            latestHistory.Note,
            latestHistory.CreatedAt));
}
