using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Api.Contracts.Requests.Admin;

public sealed record CreateCvTemplateRequest(
    string Code,
    string Name,
    string? Description,
    Guid ThumbnailFileId,
    string? Version,
    CvLayoutDocument DefaultLayout,
    CvContentDocument DefaultContent,
    string? Language = null
);

public sealed record UpdateCvTemplateRequest(
    string? Name = null,
    string? Description = null,
    Guid? ThumbnailFileId = null,
    string? Version = null,
    CvLayoutDocument? DefaultLayout = null,
    CvContentDocument? DefaultContent = null,
    bool? IsActive = null
);

