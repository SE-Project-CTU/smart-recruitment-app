using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.JobPostings.DTOs;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Application.Features.JobPostings.Mapping;
using SmartHire.Application.Features.JobPostings.Notifications;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Commands.CreateJobPosting;

public sealed class CreateJobPostingCommandHandler
    : IRequestHandler<CreateJobPostingCommand, JobPostingResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly ILocationCatalogRepository _locationRepository;
    private readonly IIndustryCatalogRepository _industryRepository;
    private readonly ISkillCatalogRepository _skillRepository;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    
    public CreateJobPostingCommandHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository,
        ILocationCatalogRepository locationRepository,
        IIndustryCatalogRepository industryRepository,
        ISkillCatalogRepository skillRepository,
        IJobPostingRepository jobPostingRepository,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
        _locationRepository = locationRepository;
        _industryRepository = industryRepository;
        _skillRepository = skillRepository;
        _jobPostingRepository = jobPostingRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
    }
    
    public async Task<JobPostingResult> Handle(
        CreateJobPostingCommand request,
        CancellationToken cancellationToken) {
        var userId = _currentUser.UserId ?? throw JobPostingExceptions.InvalidAccessToken();
        var now = DateTimeOffset.UtcNow;
        var validated = CreateJobPostingCommandValidator.Validate(request, now);
        
        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken)
                      ?? throw JobPostingExceptions.CompanyNotFound();
        if (company.VerificationStatus != CompanyVerificationStatus.Verified)
            throw JobPostingExceptions.CompanyForbidden("Company must be verified before posting jobs.");
        
        var membership = await _companyRepository.GetMembershipAsync(
            request.CompanyId, userId, cancellationToken);
        if (membership is null || membership.Status != CompanyMembershipStatus.Active)
            throw JobPostingExceptions.CompanyForbidden(
                "You must be an active member of this company to create a job posting.");
        
        if (!await _locationRepository.IsActiveProvinceAsync(request.ProvinceId, cancellationToken))
            throw JobPostingExceptions.ProvinceNotFound();
        
        if (request.WardId is Guid wardId) {
            var wardProvinceId = await _locationRepository.GetActiveWardProvinceIdAsync(
                wardId, cancellationToken);
            if (wardProvinceId is null)
                throw JobPostingExceptions.WardNotFound();
            if (wardProvinceId.Value != request.ProvinceId) {
                throw JobPostingExceptions.Validation(
                [
                    new SmartHire.Application.Common.Errors.AppErrorDetail(
                        "wardId", SmartHire.Application.Common.Errors.ValidationReasons.NotAllowed,
                        "Ward must belong to the selected province.")
                ]);
            }
        }
        
        var activeIndustryIds = await _industryRepository.GetActiveIndustryIdsAsync(
            validated.IndustryIds, cancellationToken);
        var missingIndustryIds = validated.IndustryIds.Except(activeIndustryIds).ToArray();
        if (missingIndustryIds.Length > 0)
            throw JobPostingExceptions.IndustryNotFound(missingIndustryIds);
        
        var activeSkillIds = await _skillRepository.GetActiveSkillIdsAsync(
            validated.SkillIds, cancellationToken);
        var missingSkillIds = validated.SkillIds.Except(activeSkillIds).ToArray();
        if (missingSkillIds.Length > 0)
            throw JobPostingExceptions.SkillNotFound(missingSkillIds);
        
        return await _unitOfWork.ExecuteInTransactionAsync(async ct => {
            var jobPosting = JobPosting.Create(
                request.CompanyId,
                userId,
                validated.Title,
                request.ProvinceId,
                request.WardId,
                validated.DetailedLocation,
                validated.ExperienceYears,
                validated.JobLevel,
                validated.EducationLevel,
                validated.Vacancies,
                validated.DomainWorkMode,
                validated.DomainJobType,
                validated.Description,
                validated.Requirements,
                validated.Benefits,
                validated.SalaryMin,
                validated.SalaryMax,
                validated.SalaryNegotiable,
                validated.Deadline,
                now);
            
            foreach (var industryId in validated.IndustryIds)
                jobPosting.AddIndustry(industryId);
            foreach (var skillId in validated.SkillIds)
                jobPosting.AddSkill(skillId);
            
            await _jobPostingRepository.AddAsync(jobPosting, ct);
            await _unitOfWork.SaveChangesAsync(ct);

            var followerUserIds = await _companyRepository.GetFollowerUserIdsAsync(
                company.Id,
                ct);
            var notifications = NewJobPostingNotificationFactory.CreateForFollowers(
                company,
                jobPosting,
                followerUserIds,
                now);

            await _notificationRepository.AddRangeAsync(notifications, ct);
            if (notifications.Count > 0) {
                await _unitOfWork.SaveChangesAsync(ct);
            }
            
            return JobPostingMapper.ToResult(jobPosting);
        }, cancellationToken);
    }
}
