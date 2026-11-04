namespace SmartHire.Application.Features.Ai.Matching.Models;

public sealed record MatchEngineResult(
    Guid JobId,
    decimal Score,
    ScoreBreakdown Breakdown,
    IReadOnlyList<string> MatchingSkills,
    IReadOnlyList<string> MissingSkills,
    decimal ExpYearsActual,
    int? ExpYearsRequired,
    string DetectedSeniority,
    string TargetSeniority,
    string Summary
);

