using MediatR;
using SmartHire.Application.Features.IndustryCatalog.DTOs;

namespace SmartHire.Application.Features.IndustryCatalog.Queries.GetIndustryGroupsWithIndustries;

public sealed record GetIndustryGroupsWithIndustriesQuery(
    string? Search,
    int Page = 1,
    int PageSize = 20)
    : IRequest<IndustryCatalogPageResult<IndustryGroupWithIndustriesResult>>;
