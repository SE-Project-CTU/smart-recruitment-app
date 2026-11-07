namespace SmartHire.Application.Features.JobPostings.DTOs;

public sealed record JobExperienceRange(string Value, int MinYears, int MaxYears);

public static class JobExperienceRanges
{
    public const string ZeroToOne = "0-1";
    public const string TwoToThree = "2-3";
    public const string FourToFive = "4-5";
    public const string SixPlus = "6+";

    public static readonly IReadOnlyList<JobExperienceRange> All =
    [
        new(ZeroToOne, 0, 1),
        new(TwoToThree, 2, 3),
        new(FourToFive, 4, 5),
        new(SixPlus, 6, 60)
    ];
}
