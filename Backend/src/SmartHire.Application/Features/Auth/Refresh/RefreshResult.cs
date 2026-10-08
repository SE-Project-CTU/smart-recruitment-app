namespace SmartHire.Application.Features.Auth.Refresh;

public sealed record RefreshResult(
    string AccessToken,
    string TokenType,
    int ExpiresIn,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt
);