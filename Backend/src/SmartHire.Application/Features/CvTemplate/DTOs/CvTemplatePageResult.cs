using SmartHire.Application.Features.CvTemplate.Queries;

namespace SmartHire.Application.Features.CvTemplate.DTOs;

public sealed record CvTemplatePageResult(
    IReadOnlyList<CvTemplateResult> Items,
    int Page,
    int PageSize,
    int TotalItems
);