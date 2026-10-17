using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Companies.DTOs;
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

        // Caller phải là member
        var callerMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (callerMembership is null || callerMembership.Status != CompanyMembershipStatus.Active) {
            throw new AppException(
                AppErrorKind.Forbidden,
                CompanyErrorCodes.CompanyForbidden,
                "You must be an active member of this company to view member list.");
        }

        CompanyMembershipStatus? filterStatus = null;
        if (!string.IsNullOrWhiteSpace(request.Status) &&
            Enum.TryParse<CompanyMembershipStatus>(request.Status, true, out var parsedStatus)) {
            filterStatus = parsedStatus;
        }

        var (items, totalCount) = await _companyRepository.GetMembersPagedAsync(
            request.CompanyId,
            filterStatus,
            request.Page,
            request.PageSize,
            cancellationToken);

        var results = items.Select(m => new CompanyMemberResult(
            m.Id,
            new CompanyMemberUserSummary(
                m.User.Id,
                m.User.FullName,
                m.User.Email,
                m.User.AvatarFile?.FileUrl),
            m.Role.ToString(),
            m.Status.ToString(),
            m.JoinedAt
        )).ToList();

        return (results, totalCount);
    }
}
