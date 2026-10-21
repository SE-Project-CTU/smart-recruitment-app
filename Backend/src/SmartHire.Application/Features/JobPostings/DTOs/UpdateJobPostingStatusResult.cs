namespace SmartHire.Application.Features.JobPostings.DTOs;

public sealed record UpdateJobPostingStatusResult(
    Guid Id,
    string Status,
    DateTimeOffset UpdatedAt);
