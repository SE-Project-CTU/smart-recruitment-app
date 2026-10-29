using System.Collections.Concurrent;
using MediatR;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Ai.Common;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Ai.Commands.RefreshRecommendations;

public sealed class RefreshRecommendationsCommandHandler : IRequestHandler<RefreshRecommendationsCommand, RefreshRecommendationsResult> {
    private const int CooldownSeconds = 300; // 5 minutes cooldown
    private static readonly ConcurrentDictionary<Guid, DateTimeOffset> RecentRefreshes = new();

    private readonly ICurrentUser _currentUser;
    private readonly ICvEmbeddingRepository _cvEmbeddingRepository;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly ICvRepository _cvRepository;
    private readonly IJobRecommendationRepository _recommendationRepository;
    private readonly IGeminiAiService _geminiAiService;
    private readonly IBackgroundJobScheduler _jobScheduler;

    public RefreshRecommendationsCommandHandler(
        ICurrentUser currentUser,
        ICvEmbeddingRepository cvEmbeddingRepository,
        ICvVersionRepository cvVersionRepository,
        ICvRepository cvRepository,
        IJobRecommendationRepository recommendationRepository,
        IGeminiAiService geminiAiService,
        IBackgroundJobScheduler jobScheduler) {
        _currentUser = currentUser;
        _cvEmbeddingRepository = cvEmbeddingRepository;
        _cvVersionRepository = cvVersionRepository;
        _cvRepository = cvRepository;
        _recommendationRepository = recommendationRepository;
        _geminiAiService = geminiAiService;
        _jobScheduler = jobScheduler;
    }

    public async Task<RefreshRecommendationsResult> Handle(
        RefreshRecommendationsCommand request,
        CancellationToken cancellationToken) {
        if (!_currentUser.UserId.HasValue) {
            throw AiExceptions.InvalidAccessToken();
        }

        var candidateId = _currentUser.UserId.Value;
        var now = DateTimeOffset.UtcNow;

        // 1. Check Cooldown via in-memory tracker
        if (RecentRefreshes.TryGetValue(candidateId, out var triggerTime)) {
            var elapsed = (now - triggerTime).TotalSeconds;
            if (elapsed < CooldownSeconds) {
                var remaining = (int)(CooldownSeconds - elapsed);
                throw AiExceptions.RefreshCooldownActive(remaining);
            }
        }

        // Check Cooldown via Database latest GeneratedAt
        var latestGeneratedAt = await _recommendationRepository.GetLatestGeneratedAtAsync(candidateId, cancellationToken);
        if (latestGeneratedAt.HasValue) {
            var elapsed = (now - latestGeneratedAt.Value).TotalSeconds;
            if (elapsed < CooldownSeconds) {
                var remaining = (int)(CooldownSeconds - elapsed);
                throw AiExceptions.RefreshCooldownActive(remaining);
            }
        }

        // 2. Check if CV Embeddings exist for candidate
        var cvEmbeddings = await _cvEmbeddingRepository.GetByCandidateIdAsync(candidateId, cancellationToken);
        if (cvEmbeddings.Count == 0) {
            // Check if candidate has any active CV
            var cvs = await _cvRepository.GetByCandidateIdAsync(candidateId, cancellationToken);
            if (cvs.Count == 0) {
                throw AiExceptions.NoCvEmbeddingFound("Ứng viên chưa có CV nào trong hệ thống.");
            }

            var latestCv = cvs.First();
            var latestVersion = await _cvVersionRepository.GetLatestByCvIdAsync(latestCv.Id, cancellationToken);
            if (latestVersion == null) {
                throw AiExceptions.NoCvEmbeddingFound("Ứng viên chưa có phiên bản CV nào.");
            }

            // Generate initial embedding on-the-fly
            var cvText = CvTextExtractor.ExtractText(latestVersion);
            var vectorFloats = await _geminiAiService.GenerateEmbeddingAsync(cvText, cancellationToken);
            var vector = new Pgvector.Vector(vectorFloats);
            var newEmbedding = CvEmbedding.Create(latestVersion.Id, vector, "text-embedding-004", now);
            await _cvEmbeddingRepository.UpsertAsync(newEmbedding, cancellationToken);
        }

        // 3. Mark Recent Refresh
        RecentRefreshes[candidateId] = now;

        // 4. Enqueue background pipeline job
        _jobScheduler.Enqueue<RefreshRecommendationsJob, RefreshRecommendationsJobArgs>(
            new RefreshRecommendationsJobArgs(candidateId));

        return new RefreshRecommendationsResult(
            Status: "PROCESSING",
            Message: "Yêu cầu làm mới gợi ý việc làm đã được tiếp nhận. Kết quả sẽ sẵn sàng trong vài phút.",
            EstimatedCompletionSeconds: 30
        );
    }
}
