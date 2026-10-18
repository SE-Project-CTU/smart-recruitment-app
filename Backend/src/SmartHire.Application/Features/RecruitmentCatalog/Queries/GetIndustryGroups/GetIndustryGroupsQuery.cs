using MediatR;
using SmartHire.Application.Features.RecruitmentCatalog.DTOs;

namespace SmartHire.Application.Features.RecruitmentCatalog.Queries.GetIndustryGroups;

public sealed record GetIndustryGroupsQuery(
    string? Search,
    int Page = 1,
    int PageSize = 20) : IRequest<RecruitmentCatalogPageResult<IndustryGroupResult>>;
