namespace SmartHire.Api.Contracts.Responses;

public sealed record RefreshResponse(
    string AccessToken,
    string TokenType,
    int ExpiresIn
);
