using MediatR;

namespace SmartHire.Application.Features.Auth.RegisterCandidate;

public sealed record RegisterCandidateCommand(
    string Email,
    string? Phone,
    string Password,
    string FullName
) : IRequest<RegisterCandidateResult>;