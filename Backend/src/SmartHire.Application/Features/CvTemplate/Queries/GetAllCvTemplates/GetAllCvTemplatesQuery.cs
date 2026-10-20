using MediatR;

using SmartHire.Application.Common.Validation;

namespace SmartHire.Application.Features.CvTemplate.Queries.Queries.GetAllCvTemplates;

public record GetAllCvTemplatesQuery(
    int Page = PagedListQueryValidator.FirstPage,
    int PageSize = 20,
    string? Search = null
) : IRequest<CvTemplatePageResult>;
