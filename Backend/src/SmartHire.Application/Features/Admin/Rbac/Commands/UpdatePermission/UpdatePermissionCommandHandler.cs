using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Application.Features.Admin.Rbac.DTOs;

namespace SmartHire.Application.Features.Admin.Rbac.Commands.UpdatePermission;

public sealed class UpdatePermissionCommandHandler
    : IRequestHandler<UpdatePermissionCommand, PermissionDto> {
    private readonly IPermissionRepository _permissionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePermissionCommandHandler(
        IPermissionRepository permissionRepository,
        IUnitOfWork unitOfWork) {
        _permissionRepository = permissionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PermissionDto> Handle(
        UpdatePermissionCommand request,
        CancellationToken cancellationToken) {
        var command = UpdatePermissionCommandValidator.Validate(request);

        var permission = await _permissionRepository.GetByIdAsync(command.Id, cancellationToken);
        if (permission is null) {
            throw AdminExceptions.PermissionNotFound(command.Id);
        }

        var now = DateTimeOffset.UtcNow;
        permission.Update(
            command.Name ?? permission.Name,
            command.Description ?? permission.Description,
            command.Module ?? permission.Module,
            command.IsActive,
            now);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new PermissionDto(
            permission.Id,
            permission.Code,
            permission.Name,
            permission.Description,
            permission.Module,
            permission.IsActive,
            permission.CreatedAt,
            permission.UpdatedAt);
    }
}

