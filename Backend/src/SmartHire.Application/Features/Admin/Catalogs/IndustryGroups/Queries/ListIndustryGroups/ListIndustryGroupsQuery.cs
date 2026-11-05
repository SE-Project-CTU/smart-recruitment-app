using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.IndustryGroups.Queries.ListIndustryGroups;

public sealed record ListIndustryGroupsQuery(
    string? Search = null,
    bool? IsActive = null,
    PaginationParams? Pagination = null
) : IRequest<(IReadOnlyList<AdminIndustryGroupDto> Items, int TotalCount)>;

