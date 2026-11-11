namespace SmartHire.Api.Contracts.Requests;

public sealed record GoogleLoginRequest(
    string? IdToken,
    string? Role
);

