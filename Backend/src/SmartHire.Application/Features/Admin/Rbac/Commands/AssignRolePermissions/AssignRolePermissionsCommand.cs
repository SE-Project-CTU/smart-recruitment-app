using MediatR;
using SmartHire.Application.Features.Admin.Rbac.DTOs;

namespace SmartHire.Application.Features.Admin.Rbac.Commands.AssignRolePermissions;

public sealed record AssignRolePermissionsCommand(
    Guid RoleId,
    IReadOnlyList<Guid> PermissionIds
) : IRequest<AssignRolePermissionsResult>;

