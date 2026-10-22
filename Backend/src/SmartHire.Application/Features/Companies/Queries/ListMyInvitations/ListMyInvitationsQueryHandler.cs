using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Companies.Mapping;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Queries.ListMyInvitations;

public sealed class ListMyInvitationsQueryHandler : IRequestHandler<ListMyInvitationsQuery, (IReadOnlyList<CompanyInvitationResult> Items, int TotalCount)> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;

    public ListMyInvitationsQueryHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
    }

    public async Task<(IReadOnlyList<CompanyInvitationResult> Items, int TotalCount)> Handle(ListMyInvitationsQuery request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw CompanyExceptions.InvalidAccessToken();
        }

        CompanyInvitationStatus? filterStatus = CompanyInvitationStatus.Pending;
        if (!string.IsNullOrWhiteSpace(request.Status) &&
            Enum.TryParse<CompanyInvitationStatus>(request.Status, true, out var parsedStatus)) {
            filterStatus = parsedStatus;
        }

        var (items, totalCount) = await _companyRepository.GetMyInvitationsPagedAsync(
            userId,
            filterStatus,
            request.Page,
            request.PageSize,
            cancellationToken);

        var results = items.Select(i => CompanyResultMapper.ToCompanyInvitationResult(i, i.Company)).ToList();

        return (results, totalCount);
    }
}
