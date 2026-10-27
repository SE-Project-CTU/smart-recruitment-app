using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Application.Features.JobPostings.Mapping;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Mapping;

internal static class ApplicationDetailMapper {
    public static JobApplicationResult ToResult(ApplicationDetailData application) => new(
        application.Id,
        application.JobId,
        ToJobSummaryResult(application.Job),
        new ApplicationCandidateResult(
            application.Candidate.Id,
            application.Candidate.FullName,
            application.Candidate.Email,
            application.Candidate.Phone,
            application.Candidate.AvatarUrl),
        application.CvVersionId,
        application.UploadedCvUrl,
        application.CvVersion != null ? ToCvSnapshotResult(application.CvVersion) : null,
        application.CoverLetter,
        ApplicationStatusContract.ToApiValue(application.Status),
        application.AppliedAt,
        application.UpdatedAt);

    public static ApplicationJobSummaryResult ToJobSummaryResult(ApplicationJobSummaryData job) => new(
        job.Id,
        job.Title,
        new ApplicationCompanySummaryResult(
            job.Company.Id,
            job.Company.Name,
            job.Company.LogoUrl),
        new ApplicationLocationSummaryResult(
            job.Province.Id,
            job.Province.Name),
        job.Ward != null
            ? new ApplicationLocationSummaryResult(
                job.Ward.Id,
                job.Ward.Name)
            : null,
        job.ExperienceYears,
        job.JobLevel.HasValue ? JobPostingMapper.ToApiValue(job.JobLevel.Value) : null,
        JobPostingMapper.ToApiWorkMode(job.WorkMode),
        JobPostingMapper.ToApiJobType(job.JobType),
        job.SalaryMin,
        job.SalaryMax,
        job.SalaryNegotiable,
        job.Deadline,
        JobPostingMapper.ToApiValue(job.Status));

    public static ApplicationCvSnapshotResult ToCvSnapshotResult(CvVersion version) => new(
        version.Id,
        version.CvId,
        version.TemplateId,
        version.VersionNumber,
        version.Language == CvLanguage.English ? "en" : "vi",
        version.Content,
        version.Layout,
        version.Presentation,
        version.CreatedAt);
}
