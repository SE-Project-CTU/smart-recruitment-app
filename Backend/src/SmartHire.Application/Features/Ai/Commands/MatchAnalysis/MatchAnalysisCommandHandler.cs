using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Ai.Common;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;
using SmartHire.Application.Features.Ai.Mapping;
using SmartHire.Application.Features.Ai.Matching;
using SmartHire.Application.Features.Ai.Matching.Models;
using SmartHire.Domain.Entities;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Ai.Commands.MatchAnalysis;

public sealed class MatchAnalysisCommandHandler : IRequestHandler<MatchAnalysisCommand, MatchAnalysisResultDto> {
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly ICvEmbeddingRepository _cvEmbeddingRepository;
    private readonly IJobEmbeddingRepository _jobEmbeddingRepository;
    private readonly ISmartHireMatchEngine _matchEngine;
    private readonly IGeminiAiService _geminiAiService;
    private readonly IDistributedCache _cache;

    public MatchAnalysisCommandHandler(
        IJobPostingRepository jobPostingRepository,
        ICvVersionRepository cvVersionRepository,
        ICvEmbeddingRepository cvEmbeddingRepository,
        IJobEmbeddingRepository jobEmbeddingRepository,
        ISmartHireMatchEngine matchEngine,
        IGeminiAiService geminiAiService,
        IDistributedCache cache) {
        _jobPostingRepository = jobPostingRepository;
        _cvVersionRepository = cvVersionRepository;
        _cvEmbeddingRepository = cvEmbeddingRepository;
        _jobEmbeddingRepository = jobEmbeddingRepository;
        _matchEngine = matchEngine;
        _geminiAiService = geminiAiService;
        _cache = cache;
    }

    public async Task<MatchAnalysisResultDto> Handle(MatchAnalysisCommand request, CancellationToken cancellationToken) {
        MatchAnalysisCommandValidator.Validate(request);

        // Phân giải Job Detail
        JobPostingDetailData? jobDetail = null;
        string jobKeyPart;
        string jobText;

        if (request.JobId.HasValue && request.JobId.Value != Guid.Empty) {
            var jobId = request.JobId.Value;
            jobDetail = await _jobPostingRepository.GetDetailByIdAsync(jobId, cancellationToken);
            if (jobDetail != null) {
                jobKeyPart = jobDetail.Id.ToString();
                jobText = JobTextExtractor.ExtractText(jobDetail);
            } else if (!string.IsNullOrWhiteSpace(request.JobText)) {
                jobText = request.JobText.Trim();
                using var sha = SHA256.Create();
                jobKeyPart = $"text:{Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(jobText))).ToLowerInvariant()}";
                jobDetail = BuildSimulatedJobDetail(jobText);
            } else {
                throw AiExceptions.JobPostingNotFound(jobId);
            }
        } else if (!string.IsNullOrWhiteSpace(request.JobText)) {
            jobText = request.JobText.Trim();
            using var sha = SHA256.Create();
            jobKeyPart = $"text:{Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(jobText))).ToLowerInvariant()}";
            jobDetail = BuildSimulatedJobDetail(jobText);
        } else {
            throw AiExceptions.Validation("JobId hoặc JobText là bắt buộc.", []);
        }

        // Phân giải CV Content
        CvVersion? cvVersion = null;
        if (request.CvVersionId.HasValue && request.CvVersionId.Value != Guid.Empty) {
            cvVersion = await _cvVersionRepository.GetByVersionIdAsync(request.CvVersionId.Value, cancellationToken);
        } else if (request.CvId.HasValue && request.CvId.Value != Guid.Empty) {
            cvVersion = await _cvVersionRepository.GetLatestByCvIdAsync(request.CvId.Value, cancellationToken);
        }

        string cvText;
        string cvHash;

        if (!string.IsNullOrWhiteSpace(request.CvText)) {
            cvText = request.CvText.Trim();
            using var sha = SHA256.Create();
            cvHash = Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(cvText))).ToLowerInvariant();
        } else if (cvVersion != null) {
            cvText = CvTextExtractor.ExtractText(cvVersion);
            using var sha = SHA256.Create();
            cvHash = Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(cvText))).ToLowerInvariant();
        } else {
            throw AiExceptions.CvNotFound();
        }

        // Cache Key phụ thuộc Hash nội dung thực tế (Tự động vô hiệu hóa khi CV chỉnh sửa)
        var cacheKey = $"match:{jobKeyPart}:cvhash:{cvHash}";
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

        // Lấy độ tương đồng ngữ nghĩa pgvector (nếu cả 2 phía đã có embedding)
        decimal? semanticVectorSimilarity = null;
        if (cvVersion != null && request.JobId.HasValue && request.JobId.Value != Guid.Empty) {
            try {
                var cvEmb = await _cvEmbeddingRepository.GetByCvVersionIdAsync(cvVersion.Id, cancellationToken);
                var jobEmb = await _jobEmbeddingRepository.GetByJobIdAsync(request.JobId.Value, cancellationToken);
                if (cvEmb?.Embedding != null && jobEmb?.Embedding != null) {
                    semanticVectorSimilarity = TryComputeCosineSimilarity(cvEmb.Embedding, jobEmb.Embedding);
                }
            } catch {
                // Graceful degradation: nếu chưa có vector, Match Engine vẫn chạy chuẩn xác theo Lexical + Fuzzy
            }
        }

        // Đánh giá độ tương thích bằng SmartHire In-House Match Engine (Thuần In-Memory, < 5ms)
        string rawSkillsText = SmartHireMatchEngine.ExtractSkillsBlock(cvText);

        MatchEngineResult engineResult;
        if (!string.IsNullOrWhiteSpace(request.CvText)) {
            // Khi client gửi cvText từ Editor Canvas: Luôn đánh giá trực tiếp trên văn bản mới nhất để phản ánh ngay kỹ năng vừa chỉnh sửa
            var simulatedDoc = SmartHireMatchEngine.BuildSimulatedDocumentFromText(cvText);
            engineResult = _matchEngine.Evaluate(
                simulatedDoc,
                jobDetail,
                rawCvSkillsText: rawSkillsText,
                semanticVectorSimilarity: semanticVectorSimilarity);
        } else if (cvVersion != null) {
            engineResult = _matchEngine.Evaluate(
                cvVersion.Content,
                jobDetail,
                semanticVectorSimilarity: semanticVectorSimilarity);
        } else {
            engineResult = _matchEngine.EvaluateFromText(
                cvText,
                jobDetail,
                semanticVectorSimilarity: semanticVectorSimilarity);
        }

        // Diễn giải định tính qua Gemini Flash với cơ chế Chịu lỗi mềm (Graceful Degradation)
        MatchAnalysisResultDto result;
        try {
            var explanation = await _geminiAiService.GenerateAnalysisExplanationAsync(
                cvText,
                jobText,
                engineResult.Score,
                cancellationToken);

            result = new MatchAnalysisResultDto(
                Score: engineResult.Score,
                Summary: !string.IsNullOrWhiteSpace(explanation.Summary) ? explanation.Summary : engineResult.Summary,
                MatchingSkills: engineResult.MatchingSkills,
                MissingSkills: engineResult.MissingSkills,
                Strengths: explanation.Strengths.Count > 0 ? explanation.Strengths : BuildDefaultStrengths(engineResult),
                Recommendations: explanation.Recommendations.Count > 0 ? explanation.Recommendations : BuildDefaultRecommendations(engineResult)
            );
        } catch {
            // Khi Gemini hết quota hoặc lỗi mạng: KHÔNG CRASH 500, trả về điểm số thật kèm nhận xét từ Engine
            result = new MatchAnalysisResultDto(
                Score: engineResult.Score,
                Summary: engineResult.Summary,
                MatchingSkills: engineResult.MatchingSkills,
                MissingSkills: engineResult.MissingSkills,
                Strengths: BuildDefaultStrengths(engineResult),
                Recommendations: BuildDefaultRecommendations(engineResult)
            );
        }

        // Ghi Cache 24h
        try {
            var serialized = JsonSerializer.Serialize(result);
            await _cache.SetStringAsync(cacheKey, serialized, new DistributedCacheEntryOptions {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
            }, cancellationToken);
        } catch { }

        return result;
    }

    private static JobPostingDetailData BuildSimulatedJobDetail(string jobText) {
        return new JobPostingDetailData(
            Id: Guid.Empty,
            Creator: new CreatorReadModel(Guid.Empty, "Recruiter", "recruiter@smarthire.vn", null),
            Title: "Vị trí tuyển dụng",
            Description: jobText,
            Requirements: jobText,
            Benefits: null,
            ExperienceYears: null,
            JobLevel: null,
            EducationLevel: null,
            Vacancies: 1,
            WorkMode: SmartHire.Domain.Enums.WorkMode.Onsite,
            JobType: SmartHire.Domain.Enums.JobType.FullTime,
            SalaryMin: null,
            SalaryMax: null,
            SalaryNegotiable: true,
            Deadline: null,
            Status: SmartHire.Domain.Enums.JobPostingStatus.Published,
            Company: new CompanyReadModel(Guid.Empty, "Doanh nghiệp tuyển dụng", SmartHire.Domain.Enums.CompanyVerificationStatus.Verified, null, null),
            Location: new LocationReadModel(Guid.Empty, "Toàn quốc", null, null, null),
            Industries: Array.Empty<IndustryReadModel>(),
            Skills: Array.Empty<SkillReadModel>(),
            CreatedAt: DateTimeOffset.UtcNow,
            UpdatedAt: DateTimeOffset.UtcNow
        );
    }

    private static IReadOnlyList<string> BuildDefaultStrengths(MatchEngineResult engineResult) {
        var list = new List<string> {
            $"Đã đáp ứng {engineResult.MatchingSkills.Count} kỹ năng cốt lõi theo yêu cầu công việc."
        };

        if (engineResult.ExpYearsActual > 0) {
            list.Add($"Kinh nghiệm tích lũy ({engineResult.ExpYearsActual:F1} năm) là nền tảng tốt cho cấp bậc {engineResult.TargetSeniority}.");
        }

        return list;
    }

    private static IReadOnlyList<string> BuildDefaultRecommendations(MatchEngineResult engineResult) {
        if (engineResult.MissingSkills.Count > 0) {
            return engineResult.MissingSkills.Take(3)
                .Select(s => $"Xem xét bổ sung hoặc rèn luyện thêm kỹ năng {s} để tăng tính cạnh tranh.")
                .ToList();
        }

        return new[] {
            "Hồ sơ đã bao quát các kỹ năng chuyên môn yêu cầu của vị trí này."
        };
    }

    private static decimal? TryComputeCosineSimilarity(Pgvector.Vector v1, Pgvector.Vector v2) {
        var a = v1.ToArray();
        var b = v2.ToArray();
        if (a.Length != b.Length || a.Length == 0) return null;
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.Length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        double denom = Math.Sqrt(normA) * Math.Sqrt(normB);
        if (denom <= 0) return null;
        return (decimal)Math.Clamp(dot / denom, 0.0, 1.0);
    }
}
