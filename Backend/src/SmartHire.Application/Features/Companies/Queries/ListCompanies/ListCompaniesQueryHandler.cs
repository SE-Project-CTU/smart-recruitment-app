using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Mapping;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanies;

public sealed class ListCompaniesQueryHandler
    : IRequestHandler<ListCompaniesQuery, (IReadOnlyList<CompanyResult> Items, int TotalCount)> {
    private readonly ICompanyRepository _companyRepository;

    public ListCompaniesQueryHandler(ICompanyRepository companyRepository) {
        _companyRepository = companyRepository;
    }

    public async Task<(IReadOnlyList<CompanyResult> Items, int TotalCount)> Handle(
        ListCompaniesQuery request,
        CancellationToken cancellationToken) {
        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        var (companies, totalCount) = await _companyRepository.GetCompaniesPagedAsync(
            search,
            request.Status,
            page,
            pageSize,
            cancellationToken);

        var items = companies
            .Select(c => CompanyResultMapper.ToCompanyResult(c))
            .ToList();

        return (items, totalCount);
    }
}
