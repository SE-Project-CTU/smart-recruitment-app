namespace SmartHire.Application.Features.CvTemplate.Queries.Queries.GetAllCvTemplates;

public sealed record CvTemplatePageResult(
    IReadOnlyList<CvTemplateResult> Items,
    int Page,
    int PageSize,
    int TotalItems
);