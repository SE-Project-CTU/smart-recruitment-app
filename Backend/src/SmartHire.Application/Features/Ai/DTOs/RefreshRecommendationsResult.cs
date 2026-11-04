namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record RefreshRecommendationsResult(
    string Status,
    string Message,
    int EstimatedCompletionSeconds
);
