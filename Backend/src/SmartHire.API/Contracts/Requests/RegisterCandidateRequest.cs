namespace SmartHire.Api.Contracts.Requests;

public sealed record RegisterCandidateRequest(
    string Email,
    string? Phone,
    string Password,
    string FullName
);