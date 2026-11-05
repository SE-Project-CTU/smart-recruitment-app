using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.Industries.Queries.ListIndustries;

public sealed record ListIndustriesQuery(
    Guid? GroupId = null,
    string? Search = null,
    bool? IsActive = null,
    PaginationParams? Pagination = null
) : IRequest<(IReadOnlyList<AdminIndustryDto> Items, int TotalCount)>;

