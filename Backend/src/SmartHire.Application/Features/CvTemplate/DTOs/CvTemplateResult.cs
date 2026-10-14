using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.CvTemplate.Queries;

public sealed record CvTemplateResult(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    string ThumbnailUrl,
    CvLayoutDocument DefaultLayout,
    CvContentDocument DefaultContent,
    CvPresentationDocument DefaultPresentation,
    string Version,
    bool IsActive,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);