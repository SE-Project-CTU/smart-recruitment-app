namespace SmartHire.Application.Features.Media.DTOs;

public sealed record DeleteMediaFileResult(
    Guid Id,
    bool Deleted
);
