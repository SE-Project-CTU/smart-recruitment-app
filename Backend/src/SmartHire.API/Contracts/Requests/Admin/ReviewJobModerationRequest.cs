namespace SmartHire.Api.Contracts.Requests.Admin;

public sealed record ReviewJobModerationRequest(
    string Status,
    string? RejectionReason = null
);

