using MediatR;
using Microsoft.Extensions.Logging;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.JobPostings.DTOs;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Application.Features.JobPostings.Mapping;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Commands.UpdateJobPosting;

public sealed class UpdateJobPostingCommandHandler
    : IRequestHandler<UpdateJobPostingCommand, JobPostingResult>
{
    private readonly ICurrentUser _currentUser;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly ILocationCatalogRepository _locationRepository;
    private readonly IIndustryCatalogRepository _industryRepository;
    private readonly ISkillCatalogRepository _skillRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateJobPostingCommandHandler> _logger;

    public UpdateJobPostingCommandHandler(
        ICurrentUser currentUser,
        IJobPostingRepository jobPostingRepository,
        ICompanyRepository companyRepository,
        ILocationCatalogRepository locationRepository,
        IIndustryCatalogRepository industryRepository,
        ISkillCatalogRepository skillRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateJobPostingCommandHandler> logger)
    {
        _currentUser = currentUser;
        _jobPostingRepository = jobPostingRepository;
        _companyRepository = companyRepository;
        _locationRepository = locationRepository;
        _industryRepository = industryRepository;
        _skillRepository = skillRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<JobPostingResult> Handle(
        UpdateJobPostingCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw JobPostingExceptions.InvalidAccessToken();

        var isRecruiter = _currentUser.Roles.Contains(RoleNames.Recruiter);
        if (!isRecruiter)
        {
            throw JobPostingExceptions.JobPostingForbidden();
        }

        var now = DateTimeOffset.UtcNow;
        var validated = UpdateJobPostingCommandValidator.Validate(request, now);

        var posting = await _jobPostingRepository.GetForUpdateByIdAsync(validated.JobId, cancellationToken)
            ?? throw JobPostingExceptions.JobPostingNotFound(validated.JobId);

        // Conflict check: Closed or Expired postings cannot be modified
        if (posting.Status == JobPostingStatus.Closed || posting.Status == JobPostingStatus.Expired)
        {
            throw JobPostingExceptions.JobPostingConflict(
                $"Job posting in '{posting.Status}' status cannot be updated.");
        }

        // Authorization check: User must be an Active member of the posting's company
        var membership = await _companyRepository.GetMembershipAsync(
            posting.CompanyId, userId, cancellationToken);

        if (membership is null || membership.Status != CompanyMembershipStatus.Active)
        {
            throw JobPostingExceptions.JobPostingForbidden();
        }

        // Location validation
        var effectiveProvinceId = validated.ProvinceIdProvided
            ? (validated.ProvinceId ?? posting.ProvinceId)
            : posting.ProvinceId;

        if (validated.ProvinceIdProvided && validated.ProvinceId.HasValue)
        {
            if (!await _locationRepository.IsActiveProvinceAsync(validated.ProvinceId.Value, cancellationToken))
            {
                throw JobPostingExceptions.ProvinceNotFound();
            }
        }

        if (validated.WardIdProvided && validated.WardId.HasValue)
        {
            var wardProvinceId = await _locationRepository.GetActiveWardProvinceIdAsync(
                validated.WardId.Value, cancellationToken);

            if (wardProvinceId is null)
            {
                throw JobPostingExceptions.WardNotFound();
            }

            if (wardProvinceId.Value != effectiveProvinceId)
            {
                throw JobPostingExceptions.Validation(
                [
                    new AppErrorDetail("wardId", ValidationReasons.NotAllowed,
                        "Ward must belong to the selected province.")
                ]);
            }
        }
        else if (validated.ProvinceIdProvided && !validated.WardIdProvided && posting.WardId.HasValue)
        {
            // If province changed but ward was not specified, verify current ward still belongs to new province
            var wardProvinceId = await _locationRepository.GetActiveWardProvinceIdAsync(
                posting.WardId.Value, cancellationToken);

            if (wardProvinceId != effectiveProvinceId)
            {
                throw JobPostingExceptions.Validation(
                [
                    new AppErrorDetail("wardId", ValidationReasons.NotAllowed,
                        "Existing ward does not belong to the updated province. Please provide a matching ward or null.")
                ]);
            }
        }

        // Industries catalog validation
        if (validated.IndustryIdsProvided && validated.IndustryIds is { Count: > 0 } industryIds)
        {
            var activeIndustryIds = await _industryRepository.GetActiveIndustryIdsAsync(
                industryIds, cancellationToken);
            var missingIndustryIds = industryIds.Except(activeIndustryIds).ToArray();
            if (missingIndustryIds.Length > 0)
            {
                throw JobPostingExceptions.IndustryNotFound(missingIndustryIds);
            }
        }

        // Skills catalog validation
        if (validated.SkillIdsProvided && validated.SkillIds is { Count: > 0 } skillIds)
        {
            var activeSkillIds = await _skillRepository.GetActiveSkillIdsAsync(
                skillIds, cancellationToken);
            var missingSkillIds = skillIds.Except(activeSkillIds).ToArray();
            if (missingSkillIds.Length > 0)
            {
                throw JobPostingExceptions.SkillNotFound(missingSkillIds);
            }
        }

        return await _unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            posting.Update(
                validated.Title,
                validated.ProvinceId,
                validated.WardId,
                validated.WardIdProvided,
                validated.DetailedLocation,
                validated.DetailedLocationProvided,
                validated.ExperienceYears,
                validated.JobLevel,
                validated.EducationLevel,
                validated.EducationLevelProvided,
                validated.Vacancies,
                validated.DomainWorkMode,
                validated.DomainJobType,
                validated.Description,
                validated.Requirements,
                validated.Benefits,
                validated.BenefitsProvided,
                validated.SalaryMin,
                validated.SalaryMinProvided,
                validated.SalaryMax,
                validated.SalaryMaxProvided,
                validated.SalaryNegotiable,
                validated.Deadline,
                now);

            if (validated.IndustryIdsProvided && validated.IndustryIds is not null)
            {
                posting.UpdateIndustries(validated.IndustryIds);
            }

            if (validated.SkillIdsProvided && validated.SkillIds is not null)
            {
                posting.UpdateSkills(validated.SkillIds);
            }

            await _unitOfWork.SaveChangesAsync(ct);

            return JobPostingMapper.ToResult(posting);
        }, cancellationToken);
    }
}
