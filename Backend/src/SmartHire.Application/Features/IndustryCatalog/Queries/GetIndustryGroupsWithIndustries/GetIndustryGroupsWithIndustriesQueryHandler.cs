using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.IndustryCatalog.DTOs;
using SmartHire.Application.Features.IndustryCatalog.Validation;

namespace SmartHire.Application.Features.IndustryCatalog.Queries.GetIndustryGroupsWithIndustries;

public sealed class GetIndustryGroupsWithIndustriesQueryHandler
    : IRequestHandler<GetIndustryGroupsWithIndustriesQuery,
        IndustryCatalogPageResult<IndustryGroupWithIndustriesResult>>
{
    private readonly IIndustryCatalogRepository _repository;

    public GetIndustryGroupsWithIndustriesQueryHandler(IIndustryCatalogRepository repository)
    {
        _repository = repository;
    }

    public async Task<IndustryCatalogPageResult<IndustryGroupWithIndustriesResult>> Handle(
        GetIndustryGroupsWithIndustriesQuery request,
        CancellationToken cancellationToken)
    {
        var page = IndustryCatalogQueryValidator.Validate(
            request.Page, request.PageSize, request.Search);

        var (groups, totalItems) = await _repository.GetActiveIndustryGroupsWithIndustriesAsync(
            page.Search, page.Skip, page.PageSize, cancellationToken);

        var items = groups
            .Select(group => new IndustryGroupWithIndustriesResult(
                group.Id,
                group.Name,
                group.IsActive,
                group.Industries
                    .OrderBy(industry => industry.Name)
                    .ThenBy(industry => industry.Id)
                    .Select(industry => new IndustryResult(
                        industry.Id,
                        industry.GroupId,
                        industry.Name,
                        "Active",
                        industry.IsActive))
                    .ToList()))
            .ToList();

        return new IndustryCatalogPageResult<IndustryGroupWithIndustriesResult>(
            items, page.Page, page.PageSize, totalItems);
    }
}
