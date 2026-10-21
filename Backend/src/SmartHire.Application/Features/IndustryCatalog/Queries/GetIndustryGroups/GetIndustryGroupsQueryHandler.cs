using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.IndustryCatalog.DTOs;
using SmartHire.Application.Features.IndustryCatalog.Validation;

namespace SmartHire.Application.Features.IndustryCatalog.Queries.GetIndustryGroups;

public sealed class GetIndustryGroupsQueryHandler
    : IRequestHandler<GetIndustryGroupsQuery, IndustryCatalogPageResult<IndustryGroupResult>>
{
    private readonly IIndustryCatalogRepository _repository;

    public GetIndustryGroupsQueryHandler(IIndustryCatalogRepository repository)
    {
        _repository = repository;
    }

    public async Task<IndustryCatalogPageResult<IndustryGroupResult>> Handle(
        GetIndustryGroupsQuery request,
        CancellationToken cancellationToken)
    {
        var page = IndustryCatalogQueryValidator.Validate(
            request.Page, request.PageSize, request.Search);
        var (groups, totalItems) = await _repository.GetActiveIndustryGroupsAsync(
            page.Search, page.Skip, page.PageSize, cancellationToken);

        var items = groups
            .Select(group => new IndustryGroupResult(group.Id, group.Name, group.IsActive))
            .ToList();

        return new IndustryCatalogPageResult<IndustryGroupResult>(
            items, page.Page, page.PageSize, totalItems);
    }
}
