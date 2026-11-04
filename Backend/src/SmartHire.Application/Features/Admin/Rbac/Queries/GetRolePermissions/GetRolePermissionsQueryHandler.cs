using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Application.Features.Admin.Rbac.DTOs;

namespace SmartHire.Application.Features.Admin.Rbac.Queries.GetRolePermissions;

public sealed class GetRolePermissionsQueryHandler
    : IRequestHandler<GetRolePermissionsQuery, RoleWithPermissionsDto> {
    private readonly IRoleRepository _roleRepository;

    public GetRolePermissionsQueryHandler(IRoleRepository roleRepository) {
        _roleRepository = roleRepository;
    }

    public async Task<RoleWithPermissionsDto> Handle(
        GetRolePermissionsQuery request,
        CancellationToken cancellationToken) {
        var role = await _roleRepository.GetByIdWithPermissionsAsync(request.RoleId, cancellationToken);
        if (role is null) {
            throw AdminExceptions.RoleNotFound(request.RoleId);
        }

        var permissions = role.RolePermissions
            .OrderBy(rp => rp.Permission.Module)
            .ThenBy(rp => rp.Permission.Code)
            .Select(rp => new PermissionDto(
                rp.Permission.Id,
                rp.Permission.Code,
                rp.Permission.Name,
                rp.Permission.Description,
                rp.Permission.Module,
                rp.Permission.IsActive,
                rp.Permission.CreatedAt,
                rp.Permission.UpdatedAt
            )).ToList();

        return new RoleWithPermissionsDto(role.Id, role.Name, permissions);
    }
}

