using MediatR;
using SmartHire.Application.Features.Admin.Rbac.DTOs;

namespace SmartHire.Application.Features.Admin.Rbac.Commands.UpdatePermission;

public sealed record UpdatePermissionCommand(
    Guid Id,
    string? Name = null,
    string? Description = null,
    string? Module = null,
    bool? IsActive = null
) : IRequest<PermissionDto>;

