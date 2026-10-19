using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Companies.DTOs;
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
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.");
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                CompanyErrorCodes.CompanyNotFound,
                "Company not found.");
        }

        // Caller phải là Owner của công ty
        var callerMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (callerMembership is null || callerMembership.Status != CompanyMembershipStatus.Active || callerMembership.Role != CompanyMemberRole.Owner) {
            throw new AppException(
                AppErrorKind.Forbidden,
                CompanyErrorCodes.NotCompanyOwner,
                "Only the active company owner can view join requests.");
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

        var results = items.Select(r => new CompanyJoinRequestResult(
            r.Id,
            r.CompanyId,
            r.UserId,
            r.Status.ToString(),
            r.CreatedAt,
            new CompanyJoinRequestUserSummary(
                r.User.Id,
                r.User.Email,
                r.User.FullName)
        )).ToList();

        return (results, totalCount);
    }
}
