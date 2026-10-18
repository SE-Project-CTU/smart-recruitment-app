using MediatR;
using SmartHire.Application.Features.RecruitmentCatalog.DTOs;

namespace SmartHire.Application.Features.RecruitmentCatalog.Queries.GetProvincesWithWards;

public sealed record GetProvincesWithWardsQuery(
    string? Search,
    int Page = 1,
    int PageSize = 50)
    : IRequest<RecruitmentCatalogPageResult<ProvinceWithWardsResult>>;
