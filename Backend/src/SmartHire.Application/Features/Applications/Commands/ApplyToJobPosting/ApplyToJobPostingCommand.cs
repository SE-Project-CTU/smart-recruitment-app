using MediatR;
using SmartHire.Application.Features.Applications.DTOs;

namespace SmartHire.Application.Features.Applications.Commands.ApplyToJobPosting;

public sealed record ApplyToJobPostingCommand(
    string? JobPostingId,
    Guid? CvVersionId,
    Guid? UploadedCvFileId,
    string? CoverLetter) : IRequest<JobApplicationResult>;
