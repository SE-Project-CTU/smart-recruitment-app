using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.RecruitmentCatalog.DTOs;
using SmartHire.Application.Features.RecruitmentCatalog.Validation;

namespace SmartHire.Application.Features.RecruitmentCatalog.Queries.GetIndustryGroupsWithIndustries;

public sealed class GetIndustryGroupsWithIndustriesQueryHandler
    : IRequestHandler<GetIndustryGroupsWithIndustriesQuery,
        RecruitmentCatalogPageResult<IndustryGroupWithIndustriesResult>>
{
    private readonly IIndustryCatalogRepository _repository;

    public GetIndustryGroupsWithIndustriesQueryHandler(IIndustryCatalogRepository repository)
    {
        _repository = repository;
    }

    public async Task<RecruitmentCatalogPageResult<IndustryGroupWithIndustriesResult>> Handle(
        GetIndustryGroupsWithIndustriesQuery request,
        CancellationToken cancellationToken)
    {
        var page = RecruitmentCatalogQueryValidator.Validate(
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

        return new RecruitmentCatalogPageResult<IndustryGroupWithIndustriesResult>(
            items, page.Page, page.PageSize, totalItems);
    }
}
