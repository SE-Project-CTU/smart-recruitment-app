using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Admin.Companies.DTOs;

namespace SmartHire.Application.Features.Admin.Companies.Queries.ListAdminCompanies;

public sealed class ListAdminCompaniesQueryHandler
    : IRequestHandler<ListAdminCompaniesQuery, (IReadOnlyList<AdminCompanyItemDto> Items, int TotalCount)> {
    private readonly ICompanyRepository _companyRepository;

    public ListAdminCompaniesQueryHandler(ICompanyRepository companyRepository) {
        _companyRepository = companyRepository;
    }

    public async Task<(IReadOnlyList<AdminCompanyItemDto> Items, int TotalCount)> Handle(
        ListAdminCompaniesQuery request,
        CancellationToken cancellationToken) {
        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        return await _companyRepository.GetAdminCompaniesPagedAsync(
            search,
            request.Status,
            page,
            pageSize,
            cancellationToken);
    }
}
