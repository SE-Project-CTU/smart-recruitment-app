using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IIndustryCatalogRepository
{
    Task<(IReadOnlyList<IndustryGroup> Items, int TotalCount)> GetActiveIndustryGroupsAsync(
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);

    Task<(IReadOnlyList<IndustryGroup> Items, int TotalCount)> GetActiveIndustryGroupsWithIndustriesAsync(
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);

    Task<bool> IndustryGroupExistsAsync(Guid groupId, CancellationToken cancellationToken);

    Task<(IReadOnlyList<Industry> Items, int TotalCount)> GetActiveIndustriesAsync(
        Guid? groupId,
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);
}
