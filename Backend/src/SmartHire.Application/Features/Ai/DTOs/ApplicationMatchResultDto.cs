using System.Text.Json.Serialization;

namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record ApplicationMatchResultDto(
    Guid Id,
    Guid ApplicationId,
    decimal Score,
    MatchResultAnalysisDetails Analysis,
    DateTimeOffset CreatedAt
);

public sealed record MatchResultAnalysisDetails(
    [property: JsonPropertyName("matchingSkills")] IReadOnlyList<string> MatchingSkills,
    [property: JsonPropertyName("missingSkills")] IReadOnlyList<string> MissingSkills,
    [property: JsonPropertyName("comments")] string Comments
);
