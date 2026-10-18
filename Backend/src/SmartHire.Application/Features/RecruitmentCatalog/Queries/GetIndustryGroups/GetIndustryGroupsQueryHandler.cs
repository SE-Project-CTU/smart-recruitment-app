using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.RecruitmentCatalog.DTOs;
using SmartHire.Application.Features.RecruitmentCatalog.Validation;

namespace SmartHire.Application.Features.RecruitmentCatalog.Queries.GetIndustryGroups;

public sealed class GetIndustryGroupsQueryHandler
    : IRequestHandler<GetIndustryGroupsQuery, RecruitmentCatalogPageResult<IndustryGroupResult>>
{
    private readonly IIndustryCatalogRepository _repository;

    public GetIndustryGroupsQueryHandler(IIndustryCatalogRepository repository)
    {
        _repository = repository;
    }

    public async Task<RecruitmentCatalogPageResult<IndustryGroupResult>> Handle(
        GetIndustryGroupsQuery request,
        CancellationToken cancellationToken)
    {
        var page = RecruitmentCatalogQueryValidator.Validate(
            request.Page, request.PageSize, request.Search);
        var (groups, totalItems) = await _repository.GetActiveIndustryGroupsAsync(
            page.Search, page.Skip, page.PageSize, cancellationToken);

        var items = groups
            .Select(group => new IndustryGroupResult(group.Id, group.Name, group.IsActive))
            .ToList();

        return new RecruitmentCatalogPageResult<IndustryGroupResult>(
            items, page.Page, page.PageSize, totalItems);
    }
}
