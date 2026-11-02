using MediatR;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Commands.MatchAnalysis;

public sealed record MatchAnalysisCommand(
    Guid? CvId = null,
    Guid? CvVersionId = null,
    Guid JobId = default,
    string? CvText = null,
    string? JobText = null
) : IRequest<MatchAnalysisResultDto>;
