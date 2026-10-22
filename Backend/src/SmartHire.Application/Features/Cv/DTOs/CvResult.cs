using SmartHire.Domain.Enums;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Cv.DTOs;

public sealed record CvResult(
    Guid Id,
    Guid CandidateId,
    Guid TemplateId,
    CvTemplateSummaryResult Template,
    string Title,
    CvContentDocument Content,
    CvLayoutDocument Layout,
    CvPresentationDocument Presentation,
    CvLanguage Language,
    bool IsPublic,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    CvPreviewFileResult? PreviewFile = null
);

public sealed record CvTemplateSummaryResult(
    Guid Id,
    string Code,
    string Name
);

public sealed record CvPreviewFileResult(
    Guid Id,
    string Url
);
