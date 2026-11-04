using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.Skills.Queries.ListSkills;

public sealed record ListSkillsQuery(
    string? Search = null,
    bool? IsActive = null,
    PaginationParams? Pagination = null
) : IRequest<(IReadOnlyList<AdminSkillDto> Items, int TotalCount)>;

