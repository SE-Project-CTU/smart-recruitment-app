using MediatR;

namespace SmartHire.Application.Features.CvTemplate.Queries.Queries.GetAllCvTemplates;

public record GetAllCvTemplatesQuery(
    int Page = 0,
    int PageSize = 20,
    string? Search = null
) : IRequest<CvTemplatePageResult>;
