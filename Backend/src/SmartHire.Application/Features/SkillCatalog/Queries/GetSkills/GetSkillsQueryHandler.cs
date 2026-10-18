using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.SkillCatalog.DTOs;
using SmartHire.Application.Features.SkillCatalog.Validation;

namespace SmartHire.Application.Features.SkillCatalog.Queries.GetSkills;

public sealed class GetSkillsQueryHandler
    : IRequestHandler<GetSkillsQuery, SkillCatalogPageResult<SkillResult>>
{
    private readonly ISkillCatalogRepository _repository;

    public GetSkillsQueryHandler(ISkillCatalogRepository repository)
    {
        _repository = repository;
    }

    public async Task<SkillCatalogPageResult<SkillResult>> Handle(
        GetSkillsQuery request,
        CancellationToken cancellationToken)
    {
        var page = SkillCatalogQueryValidator.Validate(
            request.Page, request.PageSize, request.Search);

        var (skills, totalItems) = await _repository.GetActiveSkillsAsync(
            page.Search, page.Skip, page.PageSize, cancellationToken);

        var items = skills
            .Select(skill => new SkillResult(skill.Id, skill.Name, skill.IsActive))
            .ToList();

        return new SkillCatalogPageResult<SkillResult>(
            items, page.Page, page.PageSize, totalItems);
    }
}
