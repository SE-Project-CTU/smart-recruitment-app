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

namespace SmartHire.Application.Features.Ai.Commands.EnhanceCvBatch;

public sealed class EnhanceCvBatchCommandHandler : IRequestHandler<EnhanceCvBatchCommand, EnhanceCvBatchResult> {
    private readonly IGeminiAiService _geminiAiService;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly IDistributedCache _cache;

    private static readonly JsonSerializerOptions JsonOptions = new() {
        PropertyNameCaseInsensitive = true
    };

    public EnhanceCvBatchCommandHandler(
        IGeminiAiService geminiAiService,
        IJobPostingRepository jobPostingRepository,
        IDistributedCache cache) {
        _geminiAiService = geminiAiService;
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

        // Ngôn ngữ của từng mục được xác định từ content, không dùng metadata CV hoặc language của request.
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
            JobContext: jobContext
        );

        // 4. Kiểm tra Cache
        var cacheKey = BuildBatchCacheKey(batchRequest);
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

        // Chỉ cache kết quả AI hợp lệ; fallback do lỗi dịch vụ phải được thử lại ở request sau.
        if (!result.IsFallback) {
            try {
                var serialized = JsonSerializer.Serialize(mapped, JsonOptions);
                await _cache.SetStringAsync(cacheKey, serialized, new DistributedCacheEntryOptions {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12)
                }, cancellationToken);
            } catch { }
        }

        return mapped;
    }

    private static string BuildBatchCacheKey(CvBatchEnhanceRequest request) {
        // Đổi phiên bản cache để không dùng lại kết quả prompt cũ; khóa chứa cả ngữ cảnh JD đã truy xuất.
        var rawKey = JsonSerializer.Serialize(request, JsonOptions);
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(rawKey);
        var hash = sha.ComputeHash(bytes);
        return $"ai:enhance:batch:v6:{Convert.ToHexString(hash).ToLowerInvariant()}";
    }
}
