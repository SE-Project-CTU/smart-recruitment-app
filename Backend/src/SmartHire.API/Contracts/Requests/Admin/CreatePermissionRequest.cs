namespace SmartHire.Api.Contracts.Requests.Admin;

public sealed record CreatePermissionRequest(
    string Code,
    string Name,
    string? Description,
    string Module
);

