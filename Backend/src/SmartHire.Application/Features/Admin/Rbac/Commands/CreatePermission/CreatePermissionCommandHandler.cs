using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Application.Features.Admin.Rbac.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Admin.Rbac.Commands.CreatePermission;

public sealed class CreatePermissionCommandHandler
    : IRequestHandler<CreatePermissionCommand, PermissionDto> {
    private readonly IPermissionRepository _permissionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePermissionCommandHandler(
        IPermissionRepository permissionRepository,
        IUnitOfWork unitOfWork) {
        _permissionRepository = permissionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PermissionDto> Handle(
        CreatePermissionCommand request,
        CancellationToken cancellationToken) {
        var command = CreatePermissionCommandValidator.Validate(request);

        var exists = await _permissionRepository.CodeExistsAsync(command.Code, cancellationToken: cancellationToken);
        if (exists) {
            throw AdminExceptions.PermissionCodeAlreadyExists(command.Code);
        }

        var now = DateTimeOffset.UtcNow;
        var permission = Permission.Create(
            command.Code,
            command.Name,
            command.Description,
            command.Module,
            now);

        await _permissionRepository.AddAsync(permission, cancellationToken);
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

