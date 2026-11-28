namespace SmartHire.Application.Features.Ai.Matching.Models;

public sealed record ScoreBreakdown(
    decimal SkillScore,
    decimal TitleScore,
    decimal ExperienceScore,
    decimal OtherScore,
    decimal SkillWeight = 0.40m,
    decimal TitleWeight = 0.25m,
    decimal ExperienceWeight = 0.25m,
    decimal OtherWeight = 0.10m
);
