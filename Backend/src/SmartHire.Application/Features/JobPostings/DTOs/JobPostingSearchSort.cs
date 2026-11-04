namespace SmartHire.Application.Features.JobPostings.DTOs;

public sealed record JobPostingSearchSort(
    string? Sort = null,
    string? Direction = null);
