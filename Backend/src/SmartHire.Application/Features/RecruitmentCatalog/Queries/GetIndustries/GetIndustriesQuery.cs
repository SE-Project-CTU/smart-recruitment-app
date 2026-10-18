using MediatR;
using SmartHire.Application.Features.RecruitmentCatalog.DTOs;

namespace SmartHire.Application.Features.RecruitmentCatalog.Queries.GetIndustries;

public sealed record GetIndustriesQuery(
    Guid? GroupId,
    string? Search,
    int Page = 1,
    int PageSize = 20) : IRequest<RecruitmentCatalogPageResult<IndustryResult>>;
