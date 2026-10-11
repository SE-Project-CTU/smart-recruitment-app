namespace SmartHire.Api.Contracts.Requests;

public sealed record LogoutRequest(
    string? RefreshToken,
    bool AllSessions = false
);