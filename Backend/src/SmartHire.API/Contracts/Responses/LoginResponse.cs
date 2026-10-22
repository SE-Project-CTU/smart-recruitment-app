using SmartHire.Application.Features.Auth.Login;

namespace SmartHire.Api.Contracts.Responses;

public sealed record LoginResponse(
    string AccessToken,
    string TokenType,
    int ExpiresIn,
    LoginUserResult User
);
