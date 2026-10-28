using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.JobPostings.DTOs;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Queries.SearchJobPostings;

public sealed class SearchJobPostingsQueryHandler
    : IRequestHandler<SearchJobPostingsQuery, SearchJobPostingsPage> {
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly ILocationCatalogRepository _locationRepository;
    private readonly ICompanyRepository _companyRepository;
    
    public SearchJobPostingsQueryHandler(
        IJobPostingRepository jobPostingRepository,
        ILocationCatalogRepository locationRepository,
        ICompanyRepository companyRepository) {
        _jobPostingRepository = jobPostingRepository;
        _locationRepository = locationRepository;
        _companyRepository = companyRepository;
    }
    
    public async Task<SearchJobPostingsPage> Handle(
        SearchJobPostingsQuery request,
        CancellationToken cancellationToken) {
        var criteria = SearchJobPostingsQueryValidator.Validate(request);
        
        if (criteria.Filter.CompanyId is Guid companyId) {
            var company = await _companyRepository.GetByIdAsync(companyId, cancellationToken);
            if (company is null)
                throw JobPostingExceptions.CompanyNotFound();
        }

        if (criteria.Filter.ProvinceId is Guid provinceId &&
            !await _locationRepository.IsActiveProvinceAsync(provinceId, cancellationToken))
            throw JobPostingExceptions.ProvinceNotFound();
        
        if (criteria.Filter.WardId is Guid wardId) {
            var wardProvinceId = await _locationRepository.GetActiveWardProvinceIdAsync(wardId, cancellationToken);
            if (wardProvinceId is null)
                throw JobPostingExceptions.WardNotFound();
            if (criteria.Filter.ProvinceId is Guid selectedProvinceId && wardProvinceId != selectedProvinceId)
                throw JobPostingExceptions.InvalidSearchCriteria(
                [
                    new AppErrorDetail("wardId", ValidationReasons.NotAllowed,
                        "Ward must belong to the selected province.")
                ]);
        }
        
        var (searchData, totalCount) = await _jobPostingRepository.SearchPublicAsync(criteria, cancellationToken);
        var items = searchData.Select(data => new JobPostingSearchItem(
            data.Id,
            new SearchJobCompanySummary(
                data.Company.Id,
                data.Company.Name,
                data.Company.LogoFileUrl
            ),
            data.Title,
            new SearchJobProvinceSummary(data.Province.Id, data.Province.Name),
            data.Ward != null ? new SearchJobWardSummary(data.Ward.Id, data.Ward.Name) : null,
            data.ExperienceYears,
            data.JobLevel is null ? null : ToCamelCase(data.JobLevel.Value.ToString()),
            ToCamelCase(data.WorkMode.ToString()),
            ToCamelCase(data.JobType.ToString()),
            data.SalaryMin,
            data.SalaryMax,
            data.SalaryNegotiable,
            data.Deadline,
            data.Status == JobPostingStatus.Published ? "OPEN" : ToCamelCase(data.Status.ToString()),
            data.SkillNames,
            data.IndustryNames,
            data.CreatedAt)).ToArray();
        
        return new SearchJobPostingsPage(items, request.Pagination.Page, request.Pagination.PageSize, totalCount);
    }
    
    private static string ToCamelCase(string value) =>
        value.Length == 0 ? value : char.ToLowerInvariant(value[0]) + value[1..];
}
