using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Companies.Mapping;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanyMembers;

public sealed class ListCompanyMembersQueryHandler : IRequestHandler<ListCompanyMembersQuery, (IReadOnlyList<CompanyMemberResult> Items, int TotalCount)> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;

    public ListCompanyMembersQueryHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
    }

    public async Task<(IReadOnlyList<CompanyMemberResult> Items, int TotalCount)> Handle(ListCompanyMembersQuery request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw CompanyExceptions.InvalidAccessToken();
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        // Caller phải là member
        var callerMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (callerMembership is null || callerMembership.Status != CompanyMembershipStatus.Active) {
            throw CompanyExceptions.CompanyForbidden("You must be an active member of this company to view member list.");
        }

        CompanyMembershipStatus? filterStatus = null;
        if (!string.IsNullOrWhiteSpace(request.Status) &&
            Enum.TryParse<CompanyMembershipStatus>(request.Status, true, out var parsedStatus)) {
            filterStatus = parsedStatus;
        }

        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);

        var (items, totalCount) = await _companyRepository.GetMembersPagedAsync(
            request.CompanyId,
            filterStatus,
            page,
            pageSize,
            cancellationToken);

        var results = items.Select(CompanyResultMapper.ToCompanyMemberResult).ToList();

        return (results, totalCount);
    }
}
