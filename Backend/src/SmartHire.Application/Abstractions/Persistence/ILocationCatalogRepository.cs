using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface ILocationCatalogRepository
{
    Task<(IReadOnlyList<Province> Items, int TotalCount)> GetActiveProvincesAsync(
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);

    Task<(IReadOnlyList<Province> Items, int TotalCount)> GetActiveProvincesWithWardsAsync(
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);

    Task<(IReadOnlyList<Ward> Items, int TotalCount)> GetActiveWardsAsync(
        Guid? provinceId,
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);
}
