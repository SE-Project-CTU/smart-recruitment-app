using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.RecruitmentCatalog.DTOs;
using SmartHire.Application.Features.RecruitmentCatalog.Exceptions;
using SmartHire.Application.Features.RecruitmentCatalog.Validation;

namespace SmartHire.Application.Features.RecruitmentCatalog.Queries.GetIndustries;

public sealed class GetIndustriesQueryHandler
    : IRequestHandler<GetIndustriesQuery, RecruitmentCatalogPageResult<IndustryResult>>
{
    private readonly IIndustryCatalogRepository _repository;

    public GetIndustriesQueryHandler(IIndustryCatalogRepository repository)
    {
        _repository = repository;
    }

    public async Task<RecruitmentCatalogPageResult<IndustryResult>> Handle(
        GetIndustriesQuery request,
        CancellationToken cancellationToken)
    {
        var page = RecruitmentCatalogQueryValidator.Validate(
            request.Page, request.PageSize, request.Search);

        if (request.GroupId is Guid groupId &&
            !await _repository.IndustryGroupExistsAsync(groupId, cancellationToken))
        {
            throw RecruitmentCatalogExceptions.IndustryGroupNotFound();
        }

        var (industries, totalItems) = await _repository.GetActiveIndustriesAsync(
            request.GroupId, page.Search, page.Skip, page.PageSize, cancellationToken);

        var items = industries
            .Select(industry => new IndustryResult(
                industry.Id,
                industry.GroupId,
                industry.Name,
                "Active",
                industry.IsActive))
            .ToList();

        return new RecruitmentCatalogPageResult<IndustryResult>(
            items, page.Page, page.PageSize, totalItems);
    }
}
