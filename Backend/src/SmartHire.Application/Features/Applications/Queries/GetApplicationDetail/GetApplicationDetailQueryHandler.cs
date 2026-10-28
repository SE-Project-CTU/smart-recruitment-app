using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Application.Features.Applications.Exceptions;
using SmartHire.Application.Features.Applications.Mapping;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Queries.GetApplicationDetail;

public sealed class GetApplicationDetailQueryHandler
    : IRequestHandler<GetApplicationDetailQuery, JobApplicationResult> {
    private readonly ICurrentUser _currentUser;
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly ICompanyRepository _companyRepository;

    public GetApplicationDetailQueryHandler(
        ICurrentUser currentUser,
        IJobApplicationRepository applicationRepository,
        ICompanyRepository companyRepository) {
        _currentUser = currentUser;
        _applicationRepository = applicationRepository;
        _companyRepository = companyRepository;
    }

    public async Task<JobApplicationResult> Handle(
        GetApplicationDetailQuery request,
        CancellationToken cancellationToken) {
        var userId = _currentUser.UserId ?? throw ApplicationExceptions.InvalidAccessToken();
        var applicationId = GetApplicationDetailQueryValidator.Validate(request);
        var application = await _applicationRepository.GetDetailByIdAsync(
            applicationId, cancellationToken)
            ?? throw ApplicationExceptions.ApplicationNotFound(applicationId);

        var isCandidateOwner = _currentUser.Roles.Contains(RoleNames.Candidate) &&
                               application.Candidate.Id == userId;
        if (!isCandidateOwner) {
            var isRecruiter = _currentUser.Roles.Contains(RoleNames.Recruiter);
            if (!isRecruiter) throw ApplicationExceptions.ApplicationForbidden();

            var membership = await _companyRepository.GetMembershipAsync(
                application.CompanyId, userId, cancellationToken);
            if (membership is null || membership.Status != CompanyMembershipStatus.Active) {
                throw ApplicationExceptions.ApplicationForbidden();
            }
        }

        return ApplicationDetailMapper.ToResult(application);
    }
}
