using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Ai.Common;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;
using SmartHire.Application.Features.Ai.Mapping;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Ai.Commands.MatchAnalysis;

public sealed class MatchAnalysisCommandHandler : IRequestHandler<MatchAnalysisCommand, MatchAnalysisResultDto> {
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly ICohereRerankService _cohereRerankService;
    private readonly IGeminiAiService _geminiAiService;
    private readonly IDistributedCache _cache;

    public MatchAnalysisCommandHandler(
        IJobPostingRepository jobPostingRepository,
        ICvVersionRepository cvVersionRepository,
        ICohereRerankService cohereRerankService,
        IGeminiAiService geminiAiService,
        IDistributedCache cache) {
        _jobPostingRepository = jobPostingRepository;
        _cvVersionRepository = cvVersionRepository;
        _cohereRerankService = cohereRerankService;
        _geminiAiService = geminiAiService;
        _cache = cache;
    }

    public async Task<MatchAnalysisResultDto> Handle(MatchAnalysisCommand request, CancellationToken cancellationToken) {
        MatchAnalysisCommandValidator.Validate(request);

        var job = await _jobPostingRepository.GetDetailByIdAsync(request.JobId, cancellationToken);
        if (job == null) {
            throw AiExceptions.JobPostingNotFound(request.JobId);
        }

        CvVersion? cvVersion = null;
        if (request.CvVersionId.HasValue && request.CvVersionId.Value != Guid.Empty) {
            cvVersion = await _cvVersionRepository.GetByVersionIdAsync(request.CvVersionId.Value, cancellationToken);
        } else if (request.CvId.HasValue && request.CvId.Value != Guid.Empty) {
            cvVersion = await _cvVersionRepository.GetLatestByCvIdAsync(request.CvId.Value, cancellationToken);
        }

        if (cvVersion == null) {
            throw AiExceptions.CvNotFound();
        }

        // Cache Key for Redis: "match:{jobId}:{cvVersionId}"
        var cacheKey = $"match:{job.Id}:{cvVersion.Id}";
        try {
            var cachedJson = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (!string.IsNullOrWhiteSpace(cachedJson)) {
                var cachedResult = JsonSerializer.Deserialize<MatchAnalysisResultDto>(cachedJson);
                if (cachedResult != null) {
                    return cachedResult;
                }
            }
        } catch {
            // Graceful fallback if cache is temporarily unreachable
        }

        var cvText = CvTextExtractor.ExtractText(cvVersion);
        var jobText = JobTextExtractor.ExtractText(job);

        // System 1: Precision Scoring via Cohere Rerank
        var score = await _cohereRerankService.ComputeMatchScoreAsync(cvText, jobText, cancellationToken);

        // System 2: Structured Explanation via Gemini Flash
        var explanation = await _geminiAiService.GenerateAnalysisExplanationAsync(cvText, jobText, score, cancellationToken);

        var result = AiResultMapper.ToMatchAnalysisResultDto(explanation);

        // Save to Redis distributed cache with 24h expiration
        try {
            var serialized = JsonSerializer.Serialize(result);
            await _cache.SetStringAsync(cacheKey, serialized, new DistributedCacheEntryOptions {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
            }, cancellationToken);
        } catch {
            // Non-blocking cache write
        }

        return result;
    }
}
