using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.Skills.Queries.ListSkills;

public sealed class ListSkillsQueryHandler
    : IRequestHandler<ListSkillsQuery, (IReadOnlyList<AdminSkillDto> Items, int TotalCount)> {
    private readonly ISkillCatalogRepository _repository;

    public ListSkillsQueryHandler(ISkillCatalogRepository repository) {
        _repository = repository;
    }

    public async Task<(IReadOnlyList<AdminSkillDto> Items, int TotalCount)> Handle(
        ListSkillsQuery request,
        CancellationToken cancellationToken) {
        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        return await _repository.GetAdminSkillsPagedAsync(
            search,
            request.IsActive,
            page,
            pageSize,
            cancellationToken);
    }
}

