using SmartHire.Application.Features.Ai.Matching.Models;

namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record MatchAnalysisResultDto(
    decimal Score,
    string Summary,
    IReadOnlyList<string> MatchingSkills,
    IReadOnlyList<string> MissingSkills,
    IReadOnlyList<string> Strengths,
    IReadOnlyList<string> Recommendations,
    ScoreBreakdown? Breakdown = null
);
