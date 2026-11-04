using SmartHire.Application.Features.Admin.Catalogs.DTOs;
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

    Task<HashSet<Guid>> GetActiveIndustryIdsAsync(
        IReadOnlyCollection<Guid> industryIds,
        CancellationToken cancellationToken);

    Task<(IReadOnlyList<Industry> Items, int TotalCount)> GetActiveIndustriesAsync(
        Guid? groupId,
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);

    // Admin methods
    Task<(IReadOnlyList<AdminIndustryGroupDto> Items, int TotalCount)> GetAdminIndustryGroupsPagedAsync(
        string? search,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<IndustryGroup?> GetGroupByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> GroupNameExistsAsync(string name, Guid? excludeId, CancellationToken cancellationToken);
    Task AddGroupAsync(IndustryGroup group, CancellationToken cancellationToken);
    Task<bool> HasLinkedIndustriesAsync(Guid groupId, CancellationToken cancellationToken);

    Task<(IReadOnlyList<AdminIndustryDto> Items, int TotalCount)> GetAdminIndustriesPagedAsync(
        Guid? groupId,
        string? search,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<Industry?> GetIndustryByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> IndustryNameExistsAsync(string name, Guid? excludeId, CancellationToken cancellationToken);
    Task AddIndustryAsync(Industry industry, CancellationToken cancellationToken);
    Task<bool> HasLinkedJobPostingsForIndustryAsync(Guid industryId, CancellationToken cancellationToken);
}
