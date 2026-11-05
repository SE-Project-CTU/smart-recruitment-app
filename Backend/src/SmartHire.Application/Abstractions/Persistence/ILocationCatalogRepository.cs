using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence;

public interface ILocationCatalogRepository
{
    Task<bool> IsActiveProvinceAsync(Guid provinceId, CancellationToken cancellationToken);

    Task<Guid?> GetActiveWardProvinceIdAsync(Guid wardId, CancellationToken cancellationToken);

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

    // Admin methods
    Task<(IReadOnlyList<AdminProvinceDto> Items, int TotalCount)> GetAdminProvincesPagedAsync(
        string? search,
        LocationStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<Province?> GetProvinceByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> ProvinceNameExistsAsync(string name, Guid? excludeId, CancellationToken cancellationToken);
    Task AddProvinceAsync(Province province, CancellationToken cancellationToken);
    Task<bool> HasLinkedWardsOrJobsAsync(Guid provinceId, CancellationToken cancellationToken);
    Task<int> GetWardsCountByProvinceIdAsync(Guid provinceId, CancellationToken cancellationToken);

    Task<(IReadOnlyList<AdminWardDto> Items, int TotalCount)> GetAdminWardsPagedAsync(
        Guid? provinceId,
        string? search,
        LocationStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<Ward?> GetWardByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> WardNameExistsInProvinceAsync(Guid provinceId, string name, Guid? excludeId, CancellationToken cancellationToken);
    Task AddWardAsync(Ward ward, CancellationToken cancellationToken);
    Task<bool> HasLinkedJobPostingsForWardAsync(Guid wardId, CancellationToken cancellationToken);
}
