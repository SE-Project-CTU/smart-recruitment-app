using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Admin.Catalogs.DTOs;

public sealed record AdminCvTemplateItemDto(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    string? ThumbnailUrl,
    string Version,
    string Language,
    bool IsActive,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public sealed record AdminCvTemplateDetailDto(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    Guid ThumbnailFileId,
    string? ThumbnailUrl,
    string Version,
    CvLayoutDocument DefaultLayout,
    CvContentDocument DefaultContent,
    string Language,
    bool IsActive,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

