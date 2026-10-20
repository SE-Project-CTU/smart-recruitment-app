using MediatR;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.IndustryCatalog.DTOs;

namespace SmartHire.Application.Features.IndustryCatalog.Queries.GetIndustryGroups;

public sealed record GetIndustryGroupsQuery(
    string? Search,
    int Page = PagedListQueryValidator.FirstPage,
    int PageSize = 20) : IRequest<IndustryCatalogPageResult<IndustryGroupResult>>;
