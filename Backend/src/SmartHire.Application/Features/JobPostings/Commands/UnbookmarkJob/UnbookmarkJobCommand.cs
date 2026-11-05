using MediatR;

namespace SmartHire.Application.Features.JobPostings.Commands.UnbookmarkJob;

public sealed record UnbookmarkJobCommand(Guid JobPostingId) : IRequest;

