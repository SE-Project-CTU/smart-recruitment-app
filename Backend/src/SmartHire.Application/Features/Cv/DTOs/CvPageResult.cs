using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Cv.DTOs;

public sealed record CvPageResult(
    IReadOnlyList<CvListItemResult> Items,
    int Page,
    int PageSize,
    int TotalItems);

public sealed record CvListItemResult(
    Guid Id,
    Guid CandidateId,
    Guid TemplateId,
    CvTemplateSummaryResult Template,
    string Title,
    CvLanguage Language,
    bool IsPublic,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    CvPreviewFileResult? PreviewFile = null
);
