using MediatR;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Queries.RerankJobsRealtime;

public sealed record RerankJobsRealtimeQuery(
    string? CvText,
    Guid? CvId,
    Guid? CvVersionId,
    int? Limit = 20
) : IRequest<IReadOnlyList<RealtimeRecommendedJobDto>>;

