using SmartHire.Application.Features.Auth.RegisterAccount;

namespace SmartHire.Application.Features.Auth.Login;

public sealed record LoginResult(
    string AccessToken,
    string TokenType,
    int ExpiresIn,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt,
    LoginUserResult User
);

public sealed record LoginUserResult(
    Guid Id,
    string Email,
    string FullName,
    IReadOnlyList<string> Roles,
    string Status
);
