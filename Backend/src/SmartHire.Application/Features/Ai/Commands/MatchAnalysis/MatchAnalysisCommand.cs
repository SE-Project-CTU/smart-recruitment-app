using MediatR;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Commands.MatchAnalysis;

public sealed record MatchAnalysisCommand(
    Guid? CvId,
    Guid? CvVersionId,
    Guid JobId
) : IRequest<MatchAnalysisResultDto>;
