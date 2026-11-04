namespace SmartHire.Api.Contracts.Requests.Admin;

public sealed record AssignRolePermissionsRequest(
    IReadOnlyList<Guid> PermissionIds
);

