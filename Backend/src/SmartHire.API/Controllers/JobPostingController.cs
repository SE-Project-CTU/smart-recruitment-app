using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.JobPostings.Commands.CreateJobPosting;
using SmartHire.Application.Features.JobPostings.Queries.GetJobPostingDetail;
using SmartHire.Application.Features.JobPostings.Queries.SearchJobPostings;

namespace SmartHire.Api.Controllers;

[ApiController]
[Authorize(Roles = RoleNames.Recruiter)]
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
}
