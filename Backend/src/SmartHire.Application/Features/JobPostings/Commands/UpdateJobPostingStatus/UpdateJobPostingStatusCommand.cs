using MediatR;
using SmartHire.Application.Features.JobPostings.DTOs;

namespace SmartHire.Application.Features.JobPostings.Commands.UpdateJobPostingStatus;

public sealed record UpdateJobPostingStatusCommand(
    string? JobPostingId,
    string? Status) : IRequest<UpdateJobPostingStatusResult>;
