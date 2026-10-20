using MediatR;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.IndustryCatalog.DTOs;

namespace SmartHire.Application.Features.IndustryCatalog.Queries.GetIndustries;

public sealed record GetIndustriesQuery(
    Guid? GroupId,
    string? Search,
    int Page = PagedListQueryValidator.FirstPage,
    int PageSize = 20) : IRequest<IndustryCatalogPageResult<IndustryResult>>;
