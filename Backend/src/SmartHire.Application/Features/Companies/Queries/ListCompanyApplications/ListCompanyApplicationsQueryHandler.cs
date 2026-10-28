using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Companies.Mapping;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanyApplications;

public sealed class ListCompanyApplicationsQueryHandler
    : IRequestHandler<ListCompanyApplicationsQuery, (IReadOnlyList<CompanyApplicationListItemResult> Items, int TotalCount)> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IJobApplicationRepository _applicationRepository;

    public ListCompanyApplicationsQueryHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository,
        IJobApplicationRepository applicationRepository) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
        _applicationRepository = applicationRepository;
    }

    public async Task<(IReadOnlyList<CompanyApplicationListItemResult> Items, int TotalCount)> Handle(
        ListCompanyApplicationsQuery request,
        CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw CompanyExceptions.InvalidAccessToken();
        }

        if (!_currentUser.Roles.Contains(RoleNames.Recruiter)) {
            throw CompanyExceptions.CompanyForbidden("Only recruiters can access company applications.");
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        var membership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (membership is null || membership.Status != CompanyMembershipStatus.Active) {
            throw CompanyExceptions.CompanyForbidden("You must be an active member of this company to view its applications.");
        }

        var validated = ListCompanyApplicationsQueryValidator.Validate(request);

        var totalItems = await _applicationRepository.CountByCompanyIdAsync(
            validated.CompanyId,
            validated.JobId,
            validated.Status,
            validated.Search,
            cancellationToken);

        var rows = await _applicationRepository.GetPageByCompanyIdAsync(
            validated.CompanyId,
            validated.JobId,
            validated.Status,
            validated.Search,
            validated.Sort,
            validated.Direction,
            validated.Skip,
            validated.PageSize,
            cancellationToken);

        var results = rows.Select(CompanyApplicationMapper.ToResult).ToList();

        return (results, totalItems);
    }
}
