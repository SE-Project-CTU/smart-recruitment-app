using MediatR;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Queries.GetRecommendations;

public sealed record GetRecommendationsQuery(
    decimal? MinScore = null,
    int Page = 1,
    int PageSize = 20
) : IRequest<JobRecommendationPageResult>;
