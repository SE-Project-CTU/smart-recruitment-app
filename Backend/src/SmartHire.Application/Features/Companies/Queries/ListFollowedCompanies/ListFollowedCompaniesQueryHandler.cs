using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;

namespace SmartHire.Application.Features.Companies.Queries.ListFollowedCompanies;

public sealed class ListFollowedCompaniesQueryHandler
    : IRequestHandler<ListFollowedCompaniesQuery, (IReadOnlyList<FollowedCompanyResult> Items, int TotalCount)> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;

    public ListFollowedCompaniesQueryHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
    }

    public async Task<(IReadOnlyList<FollowedCompanyResult> Items, int TotalCount)> Handle(
        ListFollowedCompaniesQuery request,
        CancellationToken cancellationToken) {
        var userId = _currentUser.UserId ?? throw CompanyExceptions.InvalidAccessToken();

        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        return await _companyRepository.GetFollowedCompaniesPagedAsync(
            userId,
            search,
            page,
            pageSize,
            cancellationToken);
    }
}
