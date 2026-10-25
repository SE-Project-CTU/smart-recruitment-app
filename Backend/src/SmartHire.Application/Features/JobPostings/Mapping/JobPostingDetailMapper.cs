using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.JobPostings.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Mapping;

public static class JobPostingDetailMapper
{
    public static JobPostingDetailResult ToDetailResult(JobPostingDetailData data, DateTimeOffset now) => new(
        data.Id,
        data.Title,
        data.Description,
        data.Requirements,
        data.Benefits,
        new CompanySummary(
            data.Company.Id,
            data.Company.Name,
            data.Company.Address,
            data.Company.LogoUrl),
        new JobPostingCreatorResult(
            data.Creator.Id,
            data.Creator.FullName,
            data.Creator.Email,
            data.Creator.AvatarUrl),
        new ProvinceSummary(data.Location.ProvinceId, data.Location.ProvinceName),
        data.Location.WardId is Guid wardId
            ? new WardSummary(wardId, data.Location.WardName!)
            : null,
        data.Location.DetailedLocation,
        data.ExperienceYears,
        data.JobLevel is null ? null : ToApiValue(data.JobLevel.Value),
        data.EducationLevel is null ? null : ToApiValue(data.EducationLevel.Value),
        data.Vacancies,
        ToApiWorkMode(data.WorkMode),
        ToApiJobType(data.JobType),
        data.SalaryMin,
        data.SalaryMax,
        data.SalaryNegotiable,
        data.Deadline,
        MapStatus(data.Status),
        data.Industries.Select(i => new IndustrySummary(i.Id, i.Name)).ToArray(),
        data.Skills.Select(s => new SkillSummary(s.Id, s.Name)).ToArray(),
        data.CreatedAt,
        data.UpdatedAt);

    private static string MapStatus(JobPostingStatus status) => status switch {
        JobPostingStatus.Published => "PUBLISHED",
        JobPostingStatus.PendingReview => "PENDING_REVIEW",
        JobPostingStatus.Closed => "CLOSED",
        JobPostingStatus.Expired => "EXPIRED",
        _ => ToApiValue(status)
    };

    private static string ToApiWorkMode(WorkMode value) => value switch {
        WorkMode.Remote => "REMOTE",
        WorkMode.Onsite => "ON_SITE",
        WorkMode.Hybrid => "HYBRID",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, null)
    };

    private static string ToApiJobType(JobType value) => value switch {
        JobType.FullTime => "FULL_TIME",
        JobType.PartTime => "PART_TIME",
        JobType.Contract => "CONTRACT",
        JobType.Internship => "INTERNSHIP",
        JobType.Freelance => "FREELANCE",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, null)
    };

    private static string ToApiValue<TEnum>(TEnum value) where TEnum : struct, Enum =>
        value.ToString()
            .Select((c, i) => i > 0 && char.IsUpper(c) ? $"_{c}" : c.ToString())
            .Aggregate(string.Empty, (result, part) => result + part)
            .ToUpperInvariant();
}
