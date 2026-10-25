using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.JobPostings.Commands.CreateJobPosting;
using SmartHire.Application.Features.JobPostings.Commands.UpdateJobPosting;
using SmartHire.Application.Features.JobPostings.Commands.UpdateJobPostingStatus;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Application.Features.JobPostings.Queries.GetJobPostingDetail;
using SmartHire.Application.Features.JobPostings.Queries.SearchJobPostings;
using SmartHire.Application.Features.Applications.Commands.ApplyToJobPosting;
using SmartHire.Application.Features.Applications.Queries.ListApplicationsForJob;

namespace SmartHire.Api.Controllers;

[ApiController]
[Route("api/v1/job-postings")]
public sealed class JobPostingController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;
    
    public JobPostingController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Search(
        [FromQuery] SearchJobPostingsRequest request,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(new SearchJobPostingsQuery(
            request.Keyword,
            request.Company,
            request.CompanyId,
            request.SalaryMin,
            request.SalaryMax,
            request.ProvinceId,
            request.WardId,
            request.JobLevel,
            request.JobType,
            request.WorkMode,
            request.ExperienceYears,
            request.Sort,
            request.Direction,
            request.Page,
            request.PageSize), cancellationToken);

        return Ok(_responseFactory.PagedOneBased(
            result.Items,
            result.Page,
            result.PageSize,
            result.TotalCount));
    }
    
    [HttpPost]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> Create(
        [FromBody] CreateJobPostingRequest request,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(new CreateJobPostingCommand(
            request.CompanyId,
            request.Title,
            request.ProvinceId,
            request.WardId,
            request.DetailedLocation,
            request.ExperienceYears,
            request.JobLevel,
            request.EducationLevel,
            request.Vacancies,
            request.WorkMode,
            request.JobType,
            request.Description,
            request.Requirements,
            request.Benefits,
            request.SalaryMin,
            request.SalaryMax,
            request.SalaryNegotiable,
            request.Deadline,
            request.IndustryIds,
            request.SkillIds), cancellationToken);
        
        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    /// <summary>
    /// GET /api/v1/job-postings/{id}
    /// Public for Published+Verified+non-expired postings.
    /// Private postings (PendingReview, Closed, Expired, or non-verified company) are only
    /// visible to Recruiter users with an Active membership in the posting's company.
    /// The id is validated inside the handler so that a malformed UUID returns 400,
    /// not a 404/405 that a route-constraint would produce.
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDetail(string id, CancellationToken cancellationToken) {
        var result = await _sender.Send(new GetJobPostingDetailQuery(id), cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// PATCH /api/v1/job-postings/{id}
    /// Updates an existing job posting. Only creators or active members of the company may update.
    /// Postings in Closed or Expired states cannot be updated.
    /// Disallowed fields (companyId, createdBy, status, createdAt, updatedAt) are rejected with 422.
    /// </summary>
    [HttpPatch("{id}")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> Update(
        [FromRoute] string id,
        [FromBody] UpdateJobPostingRequest? request,
        CancellationToken cancellationToken) {
        if (request is null) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidRequestBody,
                "Request body is required.");
        }

        if (request.AdditionalFields is { Count: > 0 }) {
            var disallowedFields = request.AdditionalFields.Keys
                .Select(fieldName => new AppErrorDetail(
                    fieldName,
                    ValidationReasons.NotAllowed,
                    $"Field '{fieldName}' cannot be updated through this endpoint."))
                .ToArray();

            throw new AppException(
                AppErrorKind.Validation,
                JobPostingErrorCodes.InvalidJobPosting,
                "Request body contains disallowed fields.",
                disallowedFields);
        }

        var command = new UpdateJobPostingCommand(
            id,
            request.Title,
            request.TitleProvided,
            request.ProvinceId,
            request.ProvinceIdProvided,
            request.WardId,
            request.WardIdProvided,
            request.DetailedLocation,
            request.DetailedLocationProvided,
            request.ExperienceYears,
            request.ExperienceYearsProvided,
            request.JobLevel,
            request.JobLevelProvided,
            request.EducationLevel,
            request.EducationLevelProvided,
            request.Vacancies,
            request.VacanciesProvided,
            request.WorkMode,
            request.WorkModeProvided,
            request.JobType,
            request.JobTypeProvided,
            request.Description,
            request.DescriptionProvided,
            request.Requirements,
            request.RequirementsProvided,
            request.Benefits,
            request.BenefitsProvided,
            request.SalaryMin,
            request.SalaryMinProvided,
            request.SalaryMax,
            request.SalaryMaxProvided,
            request.SalaryNegotiable,
            request.SalaryNegotiableProvided,
            request.Deadline,
            request.DeadlineProvided,
            request.IndustryIds,
            request.IndustryIdsProvided,
            request.SkillIds,
            request.SkillIdsProvided);

        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> UpdateStatus(
        [FromRoute] string id,
        [FromBody] UpdateJobPostingStatusRequest? request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateJobPostingStatusCommand(id, request?.Status);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    [HttpPost("{id}/applications")]
    [Authorize(Roles = RoleNames.Candidate)]
    public async Task<IActionResult> Apply(
        [FromRoute] string id,
        [FromBody] ApplyToJobPostingRequest? request,
        CancellationToken cancellationToken) {
        if (request is null) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidRequestBody,
                "Request body is required.");
        }

        var result = await _sender.Send(new ApplyToJobPostingCommand(
            id,
            request.CvVersionId,
            request.UploadedCvFileId,
            request.CoverLetter), cancellationToken);

        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    [HttpGet("{id}/applications")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> ListApplications(
        [FromRoute] string id,
        [FromQuery] string? status,
        [FromQuery] int page = PagedListQueryValidator.FirstPage,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sort = null,
        [FromQuery] string? direction = null,
        CancellationToken cancellationToken = default) {
        var result = await _sender.Send(
            new ListApplicationsForJobQuery(id, status, page, pageSize, sort, direction),
            cancellationToken);

        return Ok(_responseFactory.PagedOneBased(
            result.Items,
            result.Page,
            result.PageSize,
            result.TotalItems));
    }
}
