using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Queries.ListCvTemplates;

public sealed class ListCvTemplatesQueryHandler
    : IRequestHandler<ListCvTemplatesQuery, (IReadOnlyList<AdminCvTemplateItemDto> Items, int TotalCount)> {
    private readonly ICvTemplateRepository _repository;

    public ListCvTemplatesQueryHandler(ICvTemplateRepository repository) {
        _repository = repository;
    }

    public async Task<(IReadOnlyList<AdminCvTemplateItemDto> Items, int TotalCount)> Handle(
        ListCvTemplatesQuery request,
        CancellationToken cancellationToken) {
        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        return await _repository.GetAdminCvTemplatesPagedAsync(
            search,
            request.IsActive,
            page,
            pageSize,
            cancellationToken);
    }
}

