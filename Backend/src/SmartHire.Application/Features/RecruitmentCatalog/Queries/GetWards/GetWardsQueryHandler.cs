using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.RecruitmentCatalog.DTOs;
using SmartHire.Application.Features.RecruitmentCatalog.Validation;

namespace SmartHire.Application.Features.RecruitmentCatalog.Queries.GetWards;

public sealed class GetWardsQueryHandler
    : IRequestHandler<GetWardsQuery, RecruitmentCatalogPageResult<WardResult>>
{
    private readonly ILocationCatalogRepository _repository;

    public GetWardsQueryHandler(ILocationCatalogRepository repository)
    {
        _repository = repository;
    }

    public async Task<RecruitmentCatalogPageResult<WardResult>> Handle(
        GetWardsQuery request,
        CancellationToken cancellationToken)
    {
        var page = RecruitmentCatalogQueryValidator.Validate(
            request.Page, request.PageSize, request.Search);
        var (wards, totalItems) = await _repository.GetActiveWardsAsync(
            request.ProvinceId, page.Search, page.Skip, page.PageSize, cancellationToken);

        var items = wards
            .Select(ward => new WardResult(
                ward.Id,
                ward.ProvinceId,
                ward.Name,
                ward.Status.ToString(),
                ward.IsCommune))
            .ToList();

        return new RecruitmentCatalogPageResult<WardResult>(
            items, page.Page, page.PageSize, totalItems);
    }
}
