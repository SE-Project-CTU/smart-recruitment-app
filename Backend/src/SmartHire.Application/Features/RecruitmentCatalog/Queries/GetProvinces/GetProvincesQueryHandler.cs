using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.RecruitmentCatalog.DTOs;
using SmartHire.Application.Features.RecruitmentCatalog.Validation;

namespace SmartHire.Application.Features.RecruitmentCatalog.Queries.GetProvinces;

public sealed class GetProvincesQueryHandler
    : IRequestHandler<GetProvincesQuery, RecruitmentCatalogPageResult<ProvinceResult>>
{
    private readonly ILocationCatalogRepository _repository;

    public GetProvincesQueryHandler(ILocationCatalogRepository repository)
    {
        _repository = repository;
    }

    public async Task<RecruitmentCatalogPageResult<ProvinceResult>> Handle(
        GetProvincesQuery request,
        CancellationToken cancellationToken)
    {
        var page = RecruitmentCatalogQueryValidator.Validate(
            request.Page, request.PageSize, request.Search);
        var (provinces, totalItems) = await _repository.GetActiveProvincesAsync(
            page.Search, page.Skip, page.PageSize, cancellationToken);

        var items = provinces
            .Select(province => new ProvinceResult(
                province.Id,
                province.Name,
                province.Status.ToString(),
                province.IsCentrallyGoverned))
            .ToList();

        return new RecruitmentCatalogPageResult<ProvinceResult>(
            items, page.Page, page.PageSize, totalItems);
    }
}
