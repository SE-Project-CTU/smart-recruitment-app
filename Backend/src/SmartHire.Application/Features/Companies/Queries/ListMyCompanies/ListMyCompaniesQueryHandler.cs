using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Companies.Mapping;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Companies.Queries.ListMyCompanies;

public sealed class ListMyCompaniesQueryHandler
    : IRequestHandler<ListMyCompaniesQuery, (IReadOnlyList<CompanyResult> Items, int TotalCount)> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;

    public ListMyCompaniesQueryHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
    }

    public async Task<(IReadOnlyList<CompanyResult> Items, int TotalCount)> Handle(
        ListMyCompaniesQuery request,
        CancellationToken cancellationToken) {
        var userId = _currentUser.UserId ?? throw CompanyExceptions.InvalidAccessToken();

        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        var (memberships, totalCount) = await _companyRepository.GetUserActiveCompaniesPagedAsync(
            userId,
            search,
            page,
            pageSize,
            cancellationToken);

        var items = memberships
            .Select(m => CompanyDetailMapper.ToResult(
                m.Company,
                logoUrl: m.Company.LogoFile?.FileUrl,
                membership: new CompanyMembershipSummary(
                    m.Role.ToString(),
                    m.Status.ToString())))
            .ToList();

        return (items, totalCount);
    }
}
