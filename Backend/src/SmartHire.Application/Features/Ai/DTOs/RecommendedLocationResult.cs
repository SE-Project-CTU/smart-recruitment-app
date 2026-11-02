namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record RecommendedLocationResult(
    Guid Id,
    string Name,
    string? Code = null
);

