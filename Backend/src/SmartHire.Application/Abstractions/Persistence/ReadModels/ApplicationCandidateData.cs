namespace SmartHire.Application.Abstractions.Persistence.ReadModels;

public sealed record ApplicationCandidateData(
    Guid Id,
    string FullName,
    string Email,
    string? Phone,
    string? AvatarUrl);
