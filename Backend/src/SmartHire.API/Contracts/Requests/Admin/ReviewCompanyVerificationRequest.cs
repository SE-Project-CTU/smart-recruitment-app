namespace SmartHire.Api.Contracts.Requests.Admin;

public sealed record ReviewCompanyVerificationRequest(
    string VerificationStatus,
    string? Reason = null
);
