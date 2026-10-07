namespace SmartHire.Api.Contracts.Requests;

public sealed record RefreshRequest(
    string? RefreshToken
);