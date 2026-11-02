using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Ai.Commands.EnhanceCv;
using SmartHire.Application.Features.Ai.Common;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;
using SmartHire.Application.Features.Ai.Mapping;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Ai.Commands.EnhanceCvBatch;

public sealed class EnhanceCvBatchCommandHandler : IRequestHandler<EnhanceCvBatchCommand, EnhanceCvBatchResult> {
    private readonly IGeminiAiService _geminiAiService;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly IDistributedCache _cache;

    private static readonly JsonSerializerOptions JsonOptions = new() {
        PropertyNameCaseInsensitive = true
    };

    public EnhanceCvBatchCommandHandler(
        IGeminiAiService geminiAiService,
        ICvVersionRepository cvVersionRepository,
        IJobPostingRepository jobPostingRepository,
        IDistributedCache cache) {
        _geminiAiService = geminiAiService;
        _cvVersionRepository = cvVersionRepository;
        _jobPostingRepository = jobPostingRepository;
        _cache = cache;
    }

    public async Task<EnhanceCvBatchResult> Handle(EnhanceCvBatchCommand request, CancellationToken cancellationToken) {
        if (request.Sections == null || request.Sections.Count == 0) {
            throw AiExceptions.Validation("Dữ liệu yêu cầu không hợp lệ.", [
                new AppErrorDetail("sections", "REQUIRED", "Danh sách các mục cần tối ưu không được để trống.")
            ]);
        }

        // 1. Chắt lọc ngữ cảnh Job (Context Distillation) một lần duy nhất cho toàn bộ các mục
        string? jobContext = request.TargetJobDescription?.Trim();
        string? targetJobTitle = request.TargetJobTitle?.Trim();

        if (request.TargetJobId.HasValue && request.TargetJobId.Value != Guid.Empty) {
            var job = await _jobPostingRepository.GetDetailByIdAsync(request.TargetJobId.Value, cancellationToken);
            if (job != null) {
                if (string.IsNullOrWhiteSpace(targetJobTitle)) {
                    targetJobTitle = job.Title;
                }
                var distilledJob = JobTextExtractor.DistillText(job);
                jobContext = string.IsNullOrWhiteSpace(jobContext)
                    ? distilledJob
                    : $"{distilledJob}\n{jobContext}";
            }
        }

        // 2. Ngữ cảnh CV và ngôn ngữ
        CvLanguage? cvLanguage = null;
        if (request.CvVersionId.HasValue && request.CvVersionId.Value != Guid.Empty) {
            var cvVer = await _cvVersionRepository.GetByVersionIdAsync(request.CvVersionId.Value, cancellationToken);
            cvLanguage = cvVer?.Language;
        } else if (request.CvId.HasValue && request.CvId.Value != Guid.Empty) {
            var cvVer = await _cvVersionRepository.GetLatestByCvIdAsync(request.CvId.Value, cancellationToken);
            cvLanguage = cvVer?.Language;
        }

        string resolvedLanguage;
        if (!string.IsNullOrWhiteSpace(request.Language) && !request.Language.Equals("auto", StringComparison.OrdinalIgnoreCase)) {
            resolvedLanguage = request.Language.Trim().ToLowerInvariant();
        } else if (cvLanguage.HasValue) {
            resolvedLanguage = cvLanguage.Value == CvLanguage.English ? "en" : "vi";
        } else {
            resolvedLanguage = "vi";
        }

        // 3. Chuẩn hóa danh sách các mục
        var batchSections = request.Sections
            .Where(s => !string.IsNullOrWhiteSpace(s.Content))
            .Select(s => new CvSectionBatchItem(
                SectionType: EnhanceCvCommandValidator.NormalizeSectionType(s.SectionType) ?? s.SectionType,
                Content: s.Content.Trim()
            ))
            .ToList();

        if (batchSections.Count == 0) {
            throw AiExceptions.Validation("Dữ liệu yêu cầu không hợp lệ.", [
                new AppErrorDetail("sections", "REQUIRED", "Nội dung các mục gửi lên không được rỗng.")
            ]);
        }

        var batchRequest = new CvBatchEnhanceRequest(
            Sections: batchSections,
            TargetJobTitle: targetJobTitle,
            JobContext: jobContext,
            Language: resolvedLanguage
        );

        // 4. Kiểm tra Cache
        var cacheKey = BuildBatchCacheKey(request, resolvedLanguage);
        try {
            var cachedJson = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (!string.IsNullOrWhiteSpace(cachedJson)) {
                var cached = JsonSerializer.Deserialize<EnhanceCvBatchResult>(cachedJson, JsonOptions);
                if (cached != null) return cached;
            }
        } catch { }

        // 5. Gọi Gemini trong DUY NHẤT 1 lượt request
        var result = await _geminiAiService.EnhanceCvBatchAsync(batchRequest, cancellationToken);
        var mapped = AiResultMapper.ToEnhanceCvBatchResult(result);

        // 6. Ghi Cache
        try {
            var serialized = JsonSerializer.Serialize(mapped, JsonOptions);
            await _cache.SetStringAsync(cacheKey, serialized, new DistributedCacheEntryOptions {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12)
            }, cancellationToken);
        } catch { }

        return mapped;
    }

    private static string BuildBatchCacheKey(EnhanceCvBatchCommand request, string language) {
        var rawKey = $"{request.CvId}|{request.TargetJobId}|{language}|{string.Join(";", request.Sections.Select(s => $"{s.SectionType}:{s.Content}"))}";
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(rawKey);
        var hash = sha.ComputeHash(bytes);
        return $"ai:enhance:batch:{Convert.ToHexString(hash).ToLowerInvariant()}";
    }
}
