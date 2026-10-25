namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record ApplicationCandidateResult(
    Guid Id,
    string FullName,
    string Email,
    string? AvatarUrl);
