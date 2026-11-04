using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.Provinces.Commands.UpdateProvince;

public sealed class UpdateProvinceCommandHandler
    : IRequestHandler<UpdateProvinceCommand, AdminProvinceDto> {
    private readonly ILocationCatalogRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProvinceCommandHandler(
        ILocationCatalogRepository repository,
        IUnitOfWork unitOfWork) {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminProvinceDto> Handle(
        UpdateProvinceCommand request,
        CancellationToken cancellationToken) {
        var command = UpdateProvinceCommandValidator.Validate(request);

        var province = await _repository.GetProvinceByIdAsync(command.Id, cancellationToken);
        if (province is null) {
            throw AdminExceptions.ProvinceNotFound(command.Id);
        }

        if (command.Name is not null && !string.Equals(command.Name, province.Name, StringComparison.OrdinalIgnoreCase)) {
            var exists = await _repository.ProvinceNameExistsAsync(command.Name, command.Id, cancellationToken);
            if (exists) {
                throw AdminExceptions.Conflict(
                    AdminErrorCodes.ProvinceNameAlreadyExists,
                    $"Province name '{command.Name}' already exists.",
                    "name");
            }
        }

        province.Update(command.Name, command.IsCentrallyGoverned);
        if (command.Status.HasValue) {
            // Soft Hide / Inactive logic
            province.ToggleStatus(command.Status.Value);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var count = await _repository.HasLinkedWardsOrJobsAsync(province.Id, cancellationToken) ? 1 : 0;
        return new AdminProvinceDto(
            province.Id,
            province.Name,
            province.Status.ToString().ToUpperInvariant(),
            province.IsCentrallyGoverned,
            count);
    }
}

