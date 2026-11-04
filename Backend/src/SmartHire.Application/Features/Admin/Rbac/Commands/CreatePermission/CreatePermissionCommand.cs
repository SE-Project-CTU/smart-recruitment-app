using MediatR;
using SmartHire.Application.Features.Admin.Rbac.DTOs;

namespace SmartHire.Application.Features.Admin.Rbac.Commands.CreatePermission;

public sealed record CreatePermissionCommand(
    string Code,
    string Name,
    string? Description,
    string Module
) : IRequest<PermissionDto>;

