using System.Text.Json;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Ai.Mapping;

public static class AiMatchAnalysisMapper {
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
}

