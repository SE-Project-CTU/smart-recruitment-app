using MediatR;
using SmartHire.Application.Features.JobPostings.DTOs;

namespace SmartHire.Application.Features.JobPostings.Commands.CreateJobPosting;

public sealed record CreateJobPostingCommand(
    Guid CompanyId,
    string Title,
    Guid ProvinceId,
    Guid? WardId,
    string? DetailedLocation,
    int? ExperienceYears,
    string JobLevel,
    string EducationLevel,
    int? Vacancies,
    string WorkMode,
    string JobType,
    string Description,
    string Requirements,
    string? Benefits,
    decimal? SalaryMin,
    decimal? SalaryMax,
    bool? SalaryNegotiable,
    DateTimeOffset? Deadline,
    IReadOnlyList<Guid>? IndustryIds,
    IReadOnlyList<Guid>? SkillIds) : IRequest<JobPostingResult>;
