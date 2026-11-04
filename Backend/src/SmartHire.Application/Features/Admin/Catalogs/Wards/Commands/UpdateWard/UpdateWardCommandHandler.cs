using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.Wards.Commands.UpdateWard;

public sealed class UpdateWardCommandHandler
    : IRequestHandler<UpdateWardCommand, AdminWardDto> {
    private readonly ILocationCatalogRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateWardCommandHandler(
        ILocationCatalogRepository repository,
        IUnitOfWork unitOfWork) {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminWardDto> Handle(
        UpdateWardCommand request,
        CancellationToken cancellationToken) {
        var command = UpdateWardCommandValidator.Validate(request);

        var ward = await _repository.GetWardByIdAsync(command.Id, cancellationToken);
        if (ward is null) {
            throw AdminExceptions.WardNotFound(command.Id);
        }

        var targetProvinceId = command.ProvinceId ?? ward.ProvinceId;
        if (command.ProvinceId.HasValue && command.ProvinceId.Value != ward.ProvinceId) {
            var province = await _repository.GetProvinceByIdAsync(command.ProvinceId.Value, cancellationToken);
            if (province is null) {
                throw AdminExceptions.ProvinceNotFound(command.ProvinceId.Value);
            }
        }

        if (command.Name is not null && !string.Equals(command.Name, ward.Name, StringComparison.OrdinalIgnoreCase)) {
            var exists = await _repository.WardNameExistsInProvinceAsync(targetProvinceId, command.Name, command.Id, cancellationToken);
            if (exists) {
                throw AdminExceptions.Conflict(
                    AdminErrorCodes.WardNameAlreadyExists,
                    $"Ward name '{command.Name}' already exists in province.",
                    "name");
            }
        }

        ward.Update(command.ProvinceId, command.Name, command.IsCommune);
        if (command.Status.HasValue) {
            // Soft Hide / Inactive logic
            ward.ToggleStatus(command.Status.Value);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var parentProvince = await _repository.GetProvinceByIdAsync(ward.ProvinceId, cancellationToken);
        var provinceName = parentProvince?.Name ?? string.Empty;

        return new AdminWardDto(
            ward.Id,
            ward.ProvinceId,
            provinceName,
            ward.Name,
            ward.Status.ToString().ToUpperInvariant(),
            ward.IsCommune);
    }
}

