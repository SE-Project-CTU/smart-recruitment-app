using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.JobPostings.Commands.CreateJobPosting;

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
}