using System.Text.Json;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Ai.Mapping;

public static class AiResultMapper {
    public static EnhanceCvResult ToEnhanceCvResult(CvEnhanceResult source) {
        return new EnhanceCvResult(
            OriginalContent: source.OriginalContent,
            EnhancedContent: source.EnhancedContent,
            SuggestedKeywords: source.SuggestedKeywords,
            Improvements: source.Improvements,
            DetectedSection: source.DetectedSection
        );
    }

    public static MatchAnalysisResultDto ToMatchAnalysisResultDto(MatchAnalysisResult source) {
        return new MatchAnalysisResultDto(
            Score: source.Score,
            Summary: source.Summary,
            MatchingSkills: source.MatchingSkills,
            MissingSkills: source.MissingSkills,
            Strengths: source.Strengths,
            Recommendations: source.Recommendations
        );
    }

    public static ApplicationMatchResultDto ToApplicationMatchResultDto(AiMatchResult source) {
        MatchResultAnalysisDetails parsedAnalysis;
        try {
            parsedAnalysis = JsonSerializer.Deserialize<MatchResultAnalysisDetails>(
                source.Analysis,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new MatchResultAnalysisDetails([], [], source.Analysis);
        } catch {
            parsedAnalysis = new MatchResultAnalysisDetails([], [], source.Analysis);
        }

        return new ApplicationMatchResultDto(
            Id: source.Id,
            ApplicationId: source.ApplicationId,
            Score: source.Score,
            Analysis: parsedAnalysis,
            CreatedAt: source.CreatedAt
        );
    }

    public static JobRecommendationItemResult ToJobRecommendationItemResult(JobRecommendation source) {
        return new JobRecommendationItemResult(
            Id: source.Id,
            Score: source.Score,
            GeneratedAt: source.GeneratedAt,
            JobPosting: new RecommendedJobPostingResult(
                Id: source.Job.Id,
                Title: source.Job.Title,
                CompanyName: source.Job.Company?.Name ?? string.Empty,
                LogoUrl: source.Job.Company?.LogoFile?.FileUrl,
                Province: new RecommendedLocationResult(
                    Id: source.Job.Province.Id,
                    Name: source.Job.Province.Name
                ),
                Ward: source.Job.Ward != null ? new RecommendedLocationResult(
                    Id: source.Job.Ward.Id,
                    Name: source.Job.Ward.Name
                ) : null,
                JobType: source.Job.JobType.ToString(),
                SalaryMin: source.Job.SalaryMin,
                SalaryMax: source.Job.SalaryMax,
                Deadline: source.Job.Deadline
            )
        );
    }

    public static JobRecommendationPageResult ToJobRecommendationPageResult(
        IReadOnlyList<JobRecommendation> items,
        int page,
        int pageSize,
        int totalItems) {
        var mappedItems = items.Select(ToJobRecommendationItemResult).ToList();
        return new JobRecommendationPageResult(mappedItems, page, pageSize, totalItems);
    }
}
