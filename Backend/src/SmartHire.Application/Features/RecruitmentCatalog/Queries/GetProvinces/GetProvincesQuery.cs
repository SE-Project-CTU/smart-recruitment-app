using MediatR;
using SmartHire.Application.Features.RecruitmentCatalog.DTOs;

namespace SmartHire.Application.Features.RecruitmentCatalog.Queries.GetProvinces;

public sealed record GetProvincesQuery(
    string? Search,
    int Page = 1,
    int PageSize = 50) : IRequest<RecruitmentCatalogPageResult<ProvinceResult>>;
