namespace SmartHire.Api.Contracts.Requests;

public sealed record RegisterRecruiterRequest(
    string Email,
    string? Phone,
    string Password,
    string FullName
);
