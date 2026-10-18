using MediatR;
using SmartHire.Application.Features.RecruitmentCatalog.DTOs;

namespace SmartHire.Application.Features.RecruitmentCatalog.Queries.GetIndustryGroupsWithIndustries;

public sealed record GetIndustryGroupsWithIndustriesQuery(
    string? Search,
    int Page = 1,
    int PageSize = 20)
    : IRequest<RecruitmentCatalogPageResult<IndustryGroupWithIndustriesResult>>;
