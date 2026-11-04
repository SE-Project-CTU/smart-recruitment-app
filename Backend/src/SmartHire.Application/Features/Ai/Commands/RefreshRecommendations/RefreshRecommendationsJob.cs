using Microsoft.Extensions.Logging;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Ai.Matching;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Ai.Commands.RefreshRecommendations;

public sealed record RefreshRecommendationsJobArgs(Guid CandidateId);

public sealed class RefreshRecommendationsJob : IBackgroundJob<RefreshRecommendationsJobArgs> {
    private readonly ICvEmbeddingRepository _cvEmbeddingRepository;
    private readonly IJobEmbeddingRepository _jobEmbeddingRepository;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly ISmartHireMatchEngine _matchEngine;
    private readonly IJobRecommendationRepository _recommendationRepository;
    private readonly ILogger<RefreshRecommendationsJob> _logger;

    public RefreshRecommendationsJob(
        ICvEmbeddingRepository cvEmbeddingRepository,
        IJobEmbeddingRepository jobEmbeddingRepository,
        IJobPostingRepository jobPostingRepository,
        ISmartHireMatchEngine matchEngine,
        IJobRecommendationRepository recommendationRepository,
        ILogger<RefreshRecommendationsJob> logger) {
        _cvEmbeddingRepository = cvEmbeddingRepository;
        _jobEmbeddingRepository = jobEmbeddingRepository;
        _jobPostingRepository = jobPostingRepository;
        _matchEngine = matchEngine;
        _recommendationRepository = recommendationRepository;
        _logger = logger;
    }

    public async Task ExecuteAsync(RefreshRecommendationsJobArgs args, CancellationToken cancellationToken) {
        _logger.LogInformation("Starting RefreshRecommendationsJob for Candidate {CandidateId}", args.CandidateId);

        var cvEmbeddings = await _cvEmbeddingRepository.GetByCandidateIdAsync(args.CandidateId, cancellationToken);
        if (cvEmbeddings.Count == 0) {
            _logger.LogWarning("No CV embeddings found for candidate {CandidateId}, skipping recommendation refresh", args.CandidateId);
            return;
        }

        // Dùng CV embedding mới nhất của Candidate
        var latestCvEmbedding = cvEmbeddings.OrderByDescending(e => e.CreatedAt).First();

        // Stage 1: pgvector fast similarity search (Top 40 jobs)
        var similarJobIds = await _jobEmbeddingRepository.FindTopSimilarJobsAsync(
            latestCvEmbedding.Embedding,
            40,
            cancellationToken);

        if (similarJobIds.Count == 0) {
            _logger.LogInformation("No similar job postings found via pgvector for candidate {CandidateId}", args.CandidateId);
            return;
        }

        // Stage 2: Nạp chi tiết trong 1 Query duy nhất (Triệt tiêu N+1 Query)
        var jobIds = similarJobIds.Select(s => s.JobId);
        var candidateJobs = await _jobPostingRepository.GetDetailsByIdsAsync(jobIds, cancellationToken);
        var publishedJobs = candidateJobs.Where(j => j.Status == JobPostingStatus.Published).ToList();

        if (publishedJobs.Count == 0) {
            return;
        }

        // Tạo map độ tương đồng Cosine từ pgvector: CosineSimilarity = 1.0 - Distance
        var similarities = similarJobIds.ToDictionary(
            x => x.JobId,
            x => (decimal)Math.Max(0.0, 1.0 - x.Distance));

        // Stage 3: Đánh giá bằng SmartHire In-House Match Engine (Thuần In-Memory, < 5ms)
        var rankedResults = _matchEngine.EvaluateBatch(
            latestCvEmbedding.CvVersion.Content,
            publishedJobs,
            semanticVectorSimilarities: similarities);

        // Lấy Top 20 việc làm tương thích cao nhất
        var now = DateTimeOffset.UtcNow;
        var newRecommendations = rankedResults
            .Take(20)
            .Select(r => JobRecommendation.Create(args.CandidateId, r.JobId, r.Score, now))
            .ToList();

        await _recommendationRepository.UpsertRangeAsync(newRecommendations, cancellationToken);

        _logger.LogInformation("Refreshed {Count} recommendations for Candidate {CandidateId}", newRecommendations.Count, args.CandidateId);
    }
}
