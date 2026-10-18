using MediatR;
using SmartHire.Application.Features.SkillCatalog.DTOs;

namespace SmartHire.Application.Features.SkillCatalog.Queries.GetSkills;

public sealed record GetSkillsQuery(
    string? Search,
    int Page = 1,
    int PageSize = 20)
    : IRequest<SkillCatalogPageResult<SkillResult>>;
