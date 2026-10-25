using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Companies.Mapping;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanyJobPostings;

public sealed class ListCompanyJobPostingsQueryHandler 
    : IRequestHandler<ListCompanyJobPostingsQuery, (IReadOnlyList<CompanyJobPostingResult> Items, int TotalCount)> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IJobPostingRepository _jobPostingRepository;

    public ListCompanyJobPostingsQueryHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository,
        IJobPostingRepository jobPostingRepository) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
        _jobPostingRepository = jobPostingRepository;
    }

    public async Task<(IReadOnlyList<CompanyJobPostingResult> Items, int TotalCount)> Handle(
        ListCompanyJobPostingsQuery request, 
        CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw CompanyExceptions.InvalidAccessToken();
        }

        if (!_currentUser.Roles.Contains(RoleNames.Recruiter)) {
            throw CompanyExceptions.CompanyForbidden("Only recruiters can access company job postings.");
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        var membership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (membership is null || membership.Status != CompanyMembershipStatus.Active) {
            throw CompanyExceptions.CompanyForbidden("You must be an active member of this company to view its job postings.");
        }

        JobPostingStatus? parsedStatus = null;
        if (!string.IsNullOrWhiteSpace(request.Status)) {
            var raw = request.Status.Trim();
            var normalized = raw.Replace("_", "");
            if (Enum.TryParse<JobPostingStatus>(normalized, true, out var st)) {
                parsedStatus = st;
            } else if (Enum.TryParse<JobPostingStatus>(raw, true, out var directSt)) {
                parsedStatus = directSt;
            }
        }

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : (request.PageSize > 100 ? 100 : request.PageSize);

        var (items, totalCount) = await _jobPostingRepository.GetByCompanyIdPagedAsync(
            request.CompanyId,
            parsedStatus,
            request.Search,
            page,
            pageSize,
            cancellationToken);

        var results = items.Select(CompanyJobPostingMapper.ToResult).ToList();

        return (results, totalCount);
    }
}
