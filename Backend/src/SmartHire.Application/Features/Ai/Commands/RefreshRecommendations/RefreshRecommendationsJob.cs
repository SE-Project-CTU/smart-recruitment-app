using Microsoft.Extensions.Logging;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Ai.Common;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Ai.Commands.RefreshRecommendations;

public sealed record RefreshRecommendationsJobArgs(Guid CandidateId);

public sealed class RefreshRecommendationsJob : IBackgroundJob<RefreshRecommendationsJobArgs> {
    private readonly ICvEmbeddingRepository _cvEmbeddingRepository;
    private readonly IJobEmbeddingRepository _jobEmbeddingRepository;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly ICohereRerankService _cohereRerankService;
    private readonly IJobRecommendationRepository _recommendationRepository;
    private readonly ILogger<RefreshRecommendationsJob> _logger;

    public RefreshRecommendationsJob(
        ICvEmbeddingRepository cvEmbeddingRepository,
        IJobEmbeddingRepository jobEmbeddingRepository,
        IJobPostingRepository jobPostingRepository,
        ICohereRerankService cohereRerankService,
        IJobRecommendationRepository recommendationRepository,
        ILogger<RefreshRecommendationsJob> logger) {
        _cvEmbeddingRepository = cvEmbeddingRepository;
        _jobEmbeddingRepository = jobEmbeddingRepository;
        _jobPostingRepository = jobPostingRepository;
        _cohereRerankService = cohereRerankService;
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

        // Use the latest CV embedding for candidate
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

        // Fetch details of candidate jobs
        var candidateJobs = new List<(Guid JobId, string JobText)>();
        foreach (var (jobId, _) in similarJobIds) {
            var detail = await _jobPostingRepository.GetDetailByIdAsync(jobId, cancellationToken);
            if (detail != null && detail.Status == Domain.Enums.JobPostingStatus.Published) {
                var text = JobTextExtractor.ExtractText(detail);
                candidateJobs.Add((jobId, text));
            }
        }

        if (candidateJobs.Count == 0) {
            return;
        }

        // Stage 2: Cohere Rerank precision scoring
        var cvText = CvTextExtractor.ExtractText(latestCvEmbedding.CvVersion);
        var rerankCandidates = candidateJobs.Select(j => new RerankCandidate(j.JobId, j.JobText)).ToList();

        var rerankedResults = await _cohereRerankService.RerankJobsAsync(
            cvText,
            rerankCandidates,
            cancellationToken);

        // Take top 20 recommendations
        var now = DateTimeOffset.UtcNow;
        var newRecommendations = rerankedResults
            .Take(20)
            .Select(r => JobRecommendation.Create(args.CandidateId, r.Id, r.Score, now))
            .ToList();

        await _recommendationRepository.UpsertRangeAsync(newRecommendations, cancellationToken);

        _logger.LogInformation("Refreshed {Count} recommendations for Candidate {CandidateId}", newRecommendations.Count, args.CandidateId);
    }
}
