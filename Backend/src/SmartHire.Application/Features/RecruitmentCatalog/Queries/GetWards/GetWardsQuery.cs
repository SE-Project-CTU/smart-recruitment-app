using MediatR;
using SmartHire.Application.Features.RecruitmentCatalog.DTOs;

namespace SmartHire.Application.Features.RecruitmentCatalog.Queries.GetWards;

public sealed record GetWardsQuery(
    Guid? ProvinceId,
    string? Search,
    int Page = 1,
    int PageSize = 50) : IRequest<RecruitmentCatalogPageResult<WardResult>>;
