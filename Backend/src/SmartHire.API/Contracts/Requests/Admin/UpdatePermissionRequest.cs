namespace SmartHire.Api.Contracts.Requests.Admin;

public sealed record UpdatePermissionRequest(
    string? Name = null,
    string? Description = null,
    string? Module = null,
    bool? IsActive = null
);

