namespace SmartHire.Application.Features.Media;

public sealed record MediaFileResult(
    Guid Id,
    Guid OwnerId,
    string FileName,
    string FileUrl,
    string FileType,
    long FileSize,
    DateTimeOffset CreatedAt
);
