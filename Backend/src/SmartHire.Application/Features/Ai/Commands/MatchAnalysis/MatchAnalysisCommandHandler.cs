using System.Security.Cryptography;
using System.Text;
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

        // 1. Phân giải JobText (Ưu tiên lấy từ Database để đồng bộ 100% với POST /ai/jobs/rerank)
        string jobText;
        string jobKeyPart;
        if (request.JobId.HasValue && request.JobId.Value != Guid.Empty) {
            var jobId = request.JobId.Value;
            var job = await _jobPostingRepository.GetDetailByIdAsync(jobId, cancellationToken);
            if (job != null) {
                jobText = JobTextExtractor.ExtractText(job);
                jobKeyPart = job.Id.ToString();
            } else if (!string.IsNullOrWhiteSpace(request.JobText)) {
                jobText = request.JobText.Trim();
                using var sha = SHA256.Create();
                jobKeyPart = $"text:{Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(jobText))).ToLowerInvariant()}";
            } else {
                throw AiExceptions.JobPostingNotFound(jobId);
            }
        } else if (!string.IsNullOrWhiteSpace(request.JobText)) {
            jobText = request.JobText.Trim();
            using var sha = SHA256.Create();
            jobKeyPart = $"text:{Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(jobText))).ToLowerInvariant()}";
        } else {
            throw AiExceptions.Validation("JobId hoặc JobText là bắt buộc.", []);
        }

        // 2. Phân giải CvText
        string cvText;
        string cvKeyPart;
        if (!string.IsNullOrWhiteSpace(request.CvText)) {
            cvText = request.CvText.Trim();
            using var sha = SHA256.Create();
            cvKeyPart = $"text:{Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(cvText))).ToLowerInvariant()}";
        } else {
            CvVersion? cvVersion = null;
            if (request.CvVersionId.HasValue && request.CvVersionId.Value != Guid.Empty) {
                cvVersion = await _cvVersionRepository.GetByVersionIdAsync(request.CvVersionId.Value, cancellationToken);
            } else if (request.CvId.HasValue && request.CvId.Value != Guid.Empty) {
                cvVersion = await _cvVersionRepository.GetLatestByCvIdAsync(request.CvId.Value, cancellationToken);
            }

            if (cvVersion == null) {
                throw AiExceptions.CvNotFound();
            }

            cvText = CvTextExtractor.ExtractText(cvVersion);
            cvKeyPart = cvVersion.Id.ToString();
        }

        // 3. Cache Key
        var cacheKey = $"match:{jobKeyPart}:{cvKeyPart}";
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

        // 4. System 1: Precision Scoring via Cohere Rerank
        var score = await _cohereRerankService.ComputeMatchScoreAsync(cvText, jobText, cancellationToken);

        // 5. System 2: Structured Explanation via Gemini Flash
        var explanation = await _geminiAiService.GenerateAnalysisExplanationAsync(cvText, jobText, score, cancellationToken);

        var result = AiResultMapper.ToMatchAnalysisResultDto(explanation);

        // 6. Save to Redis distributed cache with 24h expiration
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
