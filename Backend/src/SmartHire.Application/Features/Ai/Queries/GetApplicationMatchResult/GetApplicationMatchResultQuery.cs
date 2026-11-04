using MediatR;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Queries.GetApplicationMatchResult;

public sealed record GetApplicationMatchResultQuery(Guid ApplicationId) : IRequest<ApplicationMatchResultDto>;
