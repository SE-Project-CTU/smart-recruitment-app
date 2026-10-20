using SmartHire.Application.Common.Validation;

namespace SmartHire.Api.Contracts.Requests;

public sealed class SearchJobPostingsRequest
{
    public string? Keyword { get; init; }
    public string? Company { get; init; }
    public decimal? SalaryMin { get; init; }
    public decimal? SalaryMax { get; init; }
    public Guid? ProvinceId { get; init; }
    public Guid? WardId { get; init; }
    public string? JobLevel { get; init; }
    public string? JobType { get; init; }
    public string? WorkMode { get; init; }
    public int? ExperienceYears { get; init; }
    public string? Sort { get; init; }
    public string? Direction { get; init; }
    public int Page { get; init; } = PagedListQueryValidator.FirstPage;
    public int PageSize { get; init; } = 20;
}
