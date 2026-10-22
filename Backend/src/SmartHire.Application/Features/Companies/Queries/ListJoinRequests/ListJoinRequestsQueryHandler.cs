using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Companies.Mapping;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Queries.ListJoinRequests;

public sealed class ListJoinRequestsQueryHandler : IRequestHandler<ListJoinRequestsQuery, (IReadOnlyList<CompanyJoinRequestResult> Items, int TotalCount)> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;

    public ListJoinRequestsQueryHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
    }

    public async Task<(IReadOnlyList<CompanyJoinRequestResult> Items, int TotalCount)> Handle(ListJoinRequestsQuery request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw CompanyExceptions.InvalidAccessToken();
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        // Caller phải là Owner của công ty
        var callerMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (callerMembership is null || callerMembership.Status != CompanyMembershipStatus.Active || callerMembership.Role != CompanyMemberRole.Owner) {
            throw CompanyExceptions.NotCompanyOwner();
        }

        CompanyJoinRequestStatus? filterStatus = null;
        if (!string.IsNullOrWhiteSpace(request.Status) &&
            Enum.TryParse<CompanyJoinRequestStatus>(request.Status, true, out var parsedStatus)) {
            filterStatus = parsedStatus;
        }

        var (items, totalCount) = await _companyRepository.GetJoinRequestsPagedAsync(
            request.CompanyId,
            filterStatus,
            request.Page,
            request.PageSize,
            cancellationToken);

        var results = items.Select(CompanyResultMapper.ToCompanyJoinRequestResult).ToList();

        return (results, totalCount);
    }
}
