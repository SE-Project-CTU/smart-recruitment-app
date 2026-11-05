namespace SmartHire.Api.Contracts.Requests.Admin;

public sealed record UpdateUserStatusRequest(
    string Status,
    string? Reason = null
);
