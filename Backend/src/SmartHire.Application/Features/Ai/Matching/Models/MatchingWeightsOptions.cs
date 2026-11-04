namespace SmartHire.Application.Features.Ai.Matching.Models;

public sealed class MatchingWeightsOptions {
    public const string SectionName = "MatchingEngine:Weights";

    public decimal Skill { get; set; } = 0.40m;
    public decimal Title { get; set; } = 0.25m;
    public decimal Experience { get; set; } = 0.25m;
    public decimal Other { get; set; } = 0.10m;
}