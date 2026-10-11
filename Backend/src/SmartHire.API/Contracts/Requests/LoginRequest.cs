namespace SmartHire.Api.Contracts.Requests;

public sealed record LoginRequest(
    string Email,
    string Password
);