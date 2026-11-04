using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Application.Features.Admin.Rbac.DTOs;

namespace SmartHire.Application.Features.Admin.Rbac.Commands.AssignRolePermissions;

public sealed class AssignRolePermissionsCommandHandler
    : IRequestHandler<AssignRolePermissionsCommand, AssignRolePermissionsResult> {
    private readonly IRoleRepository _roleRepository;
    private readonly IPermissionRepository _permissionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AssignRolePermissionsCommandHandler(
        IRoleRepository roleRepository,
        IPermissionRepository permissionRepository,
        IUnitOfWork unitOfWork) {
        _roleRepository = roleRepository;
        _permissionRepository = permissionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AssignRolePermissionsResult> Handle(
        AssignRolePermissionsCommand request,
        CancellationToken cancellationToken) {
        var command = AssignRolePermissionsCommandValidator.Validate(request);

        var role = await _roleRepository.GetByIdWithPermissionsAsync(command.RoleId, cancellationToken);
        if (role is null) {
            throw AdminExceptions.RoleNotFound(command.RoleId);
        }

        if (command.PermissionIds.Count > 0) {
            var existingPermissions = await _permissionRepository.GetByIdsAsync(command.PermissionIds, cancellationToken);
            var existingIdSet = existingPermissions.Select(p => p.Id).ToHashSet();

            var missingIds = command.PermissionIds.Where(id => !existingIdSet.Contains(id)).ToList();
            if (missingIds.Count > 0) {
                var details = missingIds.Select(id => new AppErrorDetail(
                    "permissionIds",
                    ErrorDetailReasons.NotFound,
                    $"Permission with ID '{id}' was not found."));
                throw AdminExceptions.Validation("One or more permission IDs do not exist.", details);
            }
        }

        var now = DateTimeOffset.UtcNow;

        return await _unitOfWork.ExecuteInTransactionAsync(async ct => {
            role.ReplacePermissions(command.PermissionIds, now);
            await _unitOfWork.SaveChangesAsync(ct);

            return new AssignRolePermissionsResult(
                role.Id,
                role.Name,
                role.RolePermissions.Count,
                now);
        }, cancellationToken);
    }
}

