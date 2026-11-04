using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Application.Features.Applications.Exceptions;
using SmartHire.Application.Features.Applications.Mapping;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Queries.ListApplicationStatusHistory;

public sealed class ListApplicationStatusHistoryQueryHandler
    : IRequestHandler<ListApplicationStatusHistoryQuery, ApplicationStatusHistoryPageResult> {
    private readonly ICurrentUser _currentUser;
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly ICompanyRepository _companyRepository;

    public ListApplicationStatusHistoryQueryHandler(
        ICurrentUser currentUser,
        IJobApplicationRepository applicationRepository,
        ICompanyRepository companyRepository) {
        _currentUser = currentUser;
        _applicationRepository = applicationRepository;
        _companyRepository = companyRepository;
    }

    public async Task<ApplicationStatusHistoryPageResult> Handle(
        ListApplicationStatusHistoryQuery request,
        CancellationToken cancellationToken) {
        var userId = _currentUser.UserId ?? throw ApplicationExceptions.InvalidAccessToken();
        var validated = ListApplicationStatusHistoryQueryValidator.Validate(request);

        var application = await _applicationRepository.GetDetailByIdAsync(
            validated.ApplicationId,
            cancellationToken)
            ?? throw ApplicationExceptions.ApplicationNotFound(validated.ApplicationId);

        var isCandidateOwner = _currentUser.Roles.Contains(RoleNames.Candidate) &&
                               application.Candidate.Id == userId;
        if (!isCandidateOwner) {
            var isRecruiter = _currentUser.Roles.Contains(RoleNames.Recruiter);
            if (!isRecruiter) {
                throw ApplicationExceptions.ApplicationForbidden();
            }

            var membership = await _companyRepository.GetMembershipAsync(
                application.CompanyId,
                userId,
                cancellationToken);
            if (membership is null || membership.Status != CompanyMembershipStatus.Active) {
                throw ApplicationExceptions.ApplicationForbidden();
            }
        }

        var totalItems = await _applicationRepository.CountStatusHistoryAsync(
            validated.ApplicationId,
            cancellationToken);
        var rows = await _applicationRepository.GetStatusHistoryPageAsync(
            validated.ApplicationId,
            validated.Skip,
            validated.PageSize,
            cancellationToken);
        var items = rows.Select(ApplicationStatusHistoryMapper.ToResult).ToArray();

        return new ApplicationStatusHistoryPageResult(
            items,
            validated.Page,
            validated.PageSize,
            totalItems);
    }
}
