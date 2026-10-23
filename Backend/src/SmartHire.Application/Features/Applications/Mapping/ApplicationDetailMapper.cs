using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Applications.DTOs;

namespace SmartHire.Application.Features.Applications.Mapping;

internal static class ApplicationDetailMapper {
    public static JobApplicationResult ToResult(ApplicationDetailData application) => new(
        application.Id,
        application.JobId,
        application.CandidateId,
        application.CvVersionId,
        application.UploadedCvUrl,
        application.CoverLetter,
        ApplicationStatusContract.ToApiValue(application.Status),
        application.AppliedAt,
        application.UpdatedAt);
}
