namespace SmartHire.Application.Features.Ai.Matching.Models;

public sealed record ScoreBreakdown(
    decimal SkillScore,
    decimal TitleScore,
    decimal ExperienceScore,
    decimal OtherScore,
    bool HasPreferentialBonus,
    decimal BonusPoints
);

