namespace SmartHire.Application.Features.JobPostings.DTOs;

public sealed record BookmarkJobResult(
    Guid JobPostingId,
    bool Bookmarked,
    DateTimeOffset CreatedAt
);

