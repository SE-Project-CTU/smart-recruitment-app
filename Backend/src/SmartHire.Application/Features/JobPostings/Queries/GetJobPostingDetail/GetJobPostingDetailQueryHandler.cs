using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.JobPostings.DTOs;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Application.Features.JobPostings.Mapping;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Queries.GetJobPostingDetail;

public sealed class GetJobPostingDetailQueryHandler
    : IRequestHandler<GetJobPostingDetailQuery, JobPostingDetailResult> {
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly ICurrentUser _currentUser;
    
    public GetJobPostingDetailQueryHandler(
        IJobPostingRepository jobPostingRepository,
        ICompanyRepository companyRepository,
        ICurrentUser currentUser) {
        _jobPostingRepository = jobPostingRepository;
        _companyRepository = companyRepository;
        _currentUser = currentUser;
    }
    
    public async Task<JobPostingDetailResult> Handle(
        GetJobPostingDetailQuery request,
        CancellationToken cancellationToken) {
        if (!Guid.TryParse(request.JobId, out var id))
            throw JobPostingExceptions.InvalidJobPostingId();
        
        var now = DateTimeOffset.UtcNow;
        var posting = await _jobPostingRepository.GetDetailByIdAsync(id, cancellationToken)
                      ?? throw JobPostingExceptions.JobPostingNotFound(id);
        
        var isPublic = posting.Status == JobPostingStatus.Published
                       && posting.Company.VerificationStatus == CompanyVerificationStatus.Verified
                       && (posting.Deadline == null || posting.Deadline > now);
        
        if (!isPublic) {
            // Private posting: require a Recruiter with an Active membership in the company
            var userId = _currentUser.UserId;
            
            if (userId is null)
                throw JobPostingExceptions.JobPostingUnauthorized();
            
            var isRecruiter = _currentUser.Roles.Contains(RoleNames.Recruiter);
            if (!isRecruiter)
                throw JobPostingExceptions.JobPostingForbidden();
            
            var membership = await _companyRepository.GetMembershipAsync(
                posting.Company.Id, userId.Value, cancellationToken);
            
            if (membership is null || membership.Status != CompanyMembershipStatus.Active)
                throw JobPostingExceptions.JobPostingForbidden();
        }
        
        return JobPostingDetailMapper.ToDetailResult(posting, now);
    }
}
