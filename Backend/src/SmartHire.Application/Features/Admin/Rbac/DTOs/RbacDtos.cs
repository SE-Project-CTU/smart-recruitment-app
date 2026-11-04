namespace SmartHire.Application.Features.Admin.Rbac.DTOs;

public sealed record PermissionDto(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    string Module,
    bool IsActive,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public sealed record RoleWithPermissionsDto(
    Guid Id,
    string Name,
    IReadOnlyList<PermissionDto> Permissions
);

public sealed record AssignRolePermissionsResult(
    Guid RoleId,
    string RoleName,
    int AssignedCount,
    DateTimeOffset UpdatedAt
);
