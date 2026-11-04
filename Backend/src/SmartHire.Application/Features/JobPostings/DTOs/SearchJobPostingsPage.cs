using SmartHire.Application.Features.JobPostings.DTOs;

namespace SmartHire.Application.Features.JobPostings.DTOs;

public sealed record SearchJobPostingsPage(
    IReadOnlyList<JobPostingSearchItem> Items,
    int Page,
    int PageSize,
    int TotalCount);
