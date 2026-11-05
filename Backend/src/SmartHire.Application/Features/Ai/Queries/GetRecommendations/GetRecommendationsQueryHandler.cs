using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;
using SmartHire.Application.Features.Ai.Mapping;

namespace SmartHire.Application.Features.Ai.Queries.GetRecommendations;

public sealed class GetRecommendationsQueryHandler : IRequestHandler<GetRecommendationsQuery, JobRecommendationPageResult> {
    private readonly IJobRecommendationRepository _recommendationRepository;
    private readonly ICurrentUser _currentUser;

    public GetRecommendationsQueryHandler(
        IJobRecommendationRepository recommendationRepository,
        ICurrentUser currentUser) {
        _recommendationRepository = recommendationRepository;
        _currentUser = currentUser;
    }

    public async Task<JobRecommendationPageResult> Handle(
        GetRecommendationsQuery request,
        CancellationToken cancellationToken) {
        if (!_currentUser.UserId.HasValue) {
            throw AiExceptions.InvalidAccessToken();
        }

        var candidateId = _currentUser.UserId.Value;
        var minScore = request.MinScore ?? 50.0m;
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize switch {
            < 1 => 20,
            > 100 => 100,
            _ => request.PageSize
        };

        var totalItems = await _recommendationRepository.CountByCandidateIdAsync(
            candidateId,
            minScore,
            cancellationToken);

        var recommendations = await _recommendationRepository.GetByCandidateIdAsync(
            candidateId,
            minScore,
            page,
            pageSize,
            cancellationToken);

        return AiResultMapper.ToJobRecommendationPageResult(
            recommendations,
            page,
            pageSize,
            totalItems
        );
    }
}
