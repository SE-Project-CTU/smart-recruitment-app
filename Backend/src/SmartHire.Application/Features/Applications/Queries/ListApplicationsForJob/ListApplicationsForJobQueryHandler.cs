using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Application.Features.Applications.Mapping;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Queries.ListApplicationsForJob;

public sealed class ListApplicationsForJobQueryHandler
    : IRequestHandler<ListApplicationsForJobQuery, JobApplicationsPageResult> {
    private readonly ICurrentUser _currentUser;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly ICompanyRepository _companyRepository;

    public ListApplicationsForJobQueryHandler(
        ICurrentUser currentUser,
        IJobPostingRepository jobPostingRepository,
        IJobApplicationRepository applicationRepository,
        ICompanyRepository companyRepository) {
        _currentUser = currentUser;
        _jobPostingRepository = jobPostingRepository;
        _applicationRepository = applicationRepository;
        _companyRepository = companyRepository;
    }

    public async Task<JobApplicationsPageResult> Handle(
        ListApplicationsForJobQuery request,
        CancellationToken cancellationToken) {
        var userId = _currentUser.UserId ?? throw JobPostingExceptions.InvalidAccessToken();
        if (!_currentUser.Roles.Contains(RoleNames.Recruiter)) {
            throw JobPostingExceptions.JobPostingForbidden();
        }

        var validated = ListApplicationsForJobQueryValidator.Validate(request);
        var companyId = await _jobPostingRepository.GetCompanyIdByIdAsync(
            validated.JobPostingId, cancellationToken)
            ?? throw JobPostingExceptions.JobPostingNotFound(validated.JobPostingId);

        var membership = await _companyRepository.GetMembershipAsync(companyId, userId, cancellationToken);
        if (membership is null || membership.Status != CompanyMembershipStatus.Active) {
            throw JobPostingExceptions.JobPostingForbidden();
        }

        var totalItems = await _applicationRepository.CountByJobIdAsync(
            validated.JobPostingId, validated.Status, cancellationToken);
        var rows = await _applicationRepository.GetPageByJobIdAsync(
            validated.JobPostingId,
            validated.Status,
            validated.Sort,
            validated.Direction,
            validated.Skip,
            validated.PageSize,
            cancellationToken);
        var items = rows.Select(ApplicationListItemMapper.ToResult).ToArray();

        return new JobApplicationsPageResult(items, validated.Page, validated.PageSize, totalItems);
    }
}
