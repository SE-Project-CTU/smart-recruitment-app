using MediatR;
using SmartHire.Application.Features.IndustryCatalog.DTOs;

namespace SmartHire.Application.Features.IndustryCatalog.Queries.GetIndustryGroups;

public sealed record GetIndustryGroupsQuery(
    string? Search,
    int Page = 1,
    int PageSize = 20) : IRequest<IndustryCatalogPageResult<IndustryGroupResult>>;
