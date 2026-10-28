using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.JobPostings.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Mapping;

public class JobPostingMapper {
    public static JobPostingResult ToResult(JobPostingDetailData data) =>
        JobPostingDetailMapper.ToJobPostingResult(data);
    
    public static string ToApiWorkMode(WorkMode value) => value switch {
        WorkMode.Remote => "REMOTE",
        WorkMode.Onsite => "ON_SITE",
        WorkMode.Hybrid => "HYBRID",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, null)
    };
    
    public static string ToApiJobType(JobType value) => value switch {
        JobType.FullTime => "FULL_TIME",
        JobType.PartTime => "PART_TIME",
        JobType.Contract => "CONTRACT",
        JobType.Internship => "INTERNSHIP",
        JobType.Freelance => "FREELANCE",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, null)
    };
    
    public static string ToApiValue<TEnum>(TEnum value) where TEnum : struct, Enum =>
        value.ToString().Select((character, index) =>
                index > 0 && char.IsUpper(character) ? $"_{character}" : character.ToString())
            .Aggregate(string.Empty, (result, part) => result + part)
            .ToUpperInvariant();
}
