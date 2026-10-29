using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Ai.Common;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Mapping;

namespace SmartHire.Application.Features.Ai.Commands.EnhanceCv;

public sealed class EnhanceCvCommandHandler : IRequestHandler<EnhanceCvCommand, EnhanceCvResult> {
    private readonly IGeminiAiService _geminiAiService;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly IDistributedCache _cache;

    private static readonly JsonSerializerOptions JsonOptions = new() {
        PropertyNameCaseInsensitive = true
    };

    public EnhanceCvCommandHandler(
        IGeminiAiService geminiAiService,
        ICvVersionRepository cvVersionRepository,
        IJobPostingRepository jobPostingRepository,
        IDistributedCache cache) {
        _geminiAiService = geminiAiService;
        _cvVersionRepository = cvVersionRepository;
        _jobPostingRepository = jobPostingRepository;
        _cache = cache;
    }

    public async Task<EnhanceCvResult> Handle(EnhanceCvCommand request, CancellationToken cancellationToken) {
        EnhanceCvCommandValidator.Validate(request);

        // 1. Calculate Cache Key
        var cacheKey = BuildCacheKey(request);

        // 2. Try read from Redis cache
        try {
            var cachedJson = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (!string.IsNullOrWhiteSpace(cachedJson)) {
                var cachedResult = JsonSerializer.Deserialize<EnhanceCvResult>(cachedJson, JsonOptions);
                if (cachedResult != null) {
                    return cachedResult;
                }
            }
        } catch {
            // Graceful fallback if Redis is temporarily unreachable
        }

        // 3. Resolve context (CV, JobPosting, Content)
        var aiRequest = await CvEnhanceContextResolver.ResolveAsync(
            request,
            _cvVersionRepository,
            _jobPostingRepository,
            cancellationToken
        );

        // 4. Call Gemini AI with Google XYZ enhancement
        var result = await _geminiAiService.EnhanceCvAsync(aiRequest, cancellationToken);
        var mappedResult = AiResultMapper.ToEnhanceCvResult(result);

        // 5. Save to Redis with 24 hours expiration
        try {
            var serialized = JsonSerializer.Serialize(mappedResult, JsonOptions);
            await _cache.SetStringAsync(cacheKey, serialized, new DistributedCacheEntryOptions {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
            }, cancellationToken);
        } catch {
            // Non-blocking cache write failure
        }

        return mappedResult;
    }

    private static string BuildCacheKey(EnhanceCvCommand request) {
        var rawKey = $"{request.CvVersionId?.ToString() ?? request.CvId?.ToString() ?? request.Content?.Trim()}|{request.TargetJobId?.ToString() ?? request.TargetJobTitle?.Trim()}|{request.SectionType?.Trim()}|{request.Language?.Trim() ?? "vi"}";
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(rawKey);
        var hash = sha.ComputeHash(bytes);
        return $"ai:enhance:{Convert.ToHexString(hash).ToLowerInvariant()}";
    }
}
