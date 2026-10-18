using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.RecruitmentCatalog.DTOs;
using SmartHire.Application.Features.RecruitmentCatalog.Validation;

namespace SmartHire.Application.Features.RecruitmentCatalog.Queries.GetProvincesWithWards;

public sealed class GetProvincesWithWardsQueryHandler
    : IRequestHandler<GetProvincesWithWardsQuery,
        RecruitmentCatalogPageResult<ProvinceWithWardsResult>>
{
    private readonly ILocationCatalogRepository _repository;

    public GetProvincesWithWardsQueryHandler(ILocationCatalogRepository repository)
    {
        _repository = repository;
    }

    public async Task<RecruitmentCatalogPageResult<ProvinceWithWardsResult>> Handle(
        GetProvincesWithWardsQuery request,
        CancellationToken cancellationToken)
    {
        var page = RecruitmentCatalogQueryValidator.Validate(
            request.Page, request.PageSize, request.Search);

        var (provinces, totalItems) = await _repository.GetActiveProvincesWithWardsAsync(
            page.Search, page.Skip, page.PageSize, cancellationToken);

        var items = provinces
            .Select(province => new ProvinceWithWardsResult(
                province.Id,
                province.Name,
                province.Status.ToString(),
                province.IsCentrallyGoverned,
                province.Wards
                    .OrderBy(ward => ward.Name)
                    .ThenBy(ward => ward.Id)
                    .Select(ward => new WardResult(
                        ward.Id,
                        ward.ProvinceId,
                        ward.Name,
                        ward.Status.ToString(),
                        ward.IsCommune))
                    .ToList()))
            .ToList();

        return new RecruitmentCatalogPageResult<ProvinceWithWardsResult>(
            items, page.Page, page.PageSize, totalItems);
    }
}
