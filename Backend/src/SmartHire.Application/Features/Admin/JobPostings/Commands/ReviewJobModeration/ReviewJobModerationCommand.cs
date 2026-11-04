using MediatR;
using SmartHire.Application.Features.Admin.JobPostings.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.JobPostings.Commands.ReviewJobModeration;

public sealed record ReviewJobModerationCommand(
    Guid JobPostingId,
    JobPostingStatus Status,
    string? RejectionReason = null
) : IRequest<ReviewJobModerationResult>;

