using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.IndustryCatalog.DTOs;
using SmartHire.Application.Features.IndustryCatalog.Exceptions;
using SmartHire.Application.Features.IndustryCatalog.Validation;

namespace SmartHire.Application.Features.IndustryCatalog.Queries.GetIndustries;

public sealed class GetIndustriesQueryHandler
    : IRequestHandler<GetIndustriesQuery, IndustryCatalogPageResult<IndustryResult>>
{
    private readonly IIndustryCatalogRepository _repository;

    public GetIndustriesQueryHandler(IIndustryCatalogRepository repository)
    {
        _repository = repository;
    }

    public async Task<IndustryCatalogPageResult<IndustryResult>> Handle(
        GetIndustriesQuery request,
        CancellationToken cancellationToken)
    {
        var page = IndustryCatalogQueryValidator.Validate(
            request.Page, request.PageSize, request.Search);

        if (request.GroupId is Guid groupId &&
            !await _repository.IndustryGroupExistsAsync(groupId, cancellationToken))
        {
            throw IndustryCatalogExceptions.IndustryGroupNotFound();
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

        return new IndustryCatalogPageResult<IndustryResult>(
            items, page.Page, page.PageSize, totalItems);
    }
}
