using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Admin.Catalogs.Wards.Commands.CreateWard;

public sealed class CreateWardCommandHandler
    : IRequestHandler<CreateWardCommand, AdminWardDto> {
    private readonly ILocationCatalogRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateWardCommandHandler(
        ILocationCatalogRepository repository,
        IUnitOfWork unitOfWork) {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminWardDto> Handle(
        CreateWardCommand request,
        CancellationToken cancellationToken) {
        var command = CreateWardCommandValidator.Validate(request);

        var province = await _repository.GetProvinceByIdAsync(command.ProvinceId, cancellationToken);
        if (province is null) {
            throw AdminExceptions.ProvinceNotFound(command.ProvinceId);
        }

        var exists = await _repository.WardNameExistsInProvinceAsync(command.ProvinceId, command.Name, null, cancellationToken);
        if (exists) {
            throw AdminExceptions.Conflict(
                AdminErrorCodes.WardNameAlreadyExists,
                $"Ward name '{command.Name}' already exists in province '{province.Name}'.",
                "name");
        }

        var ward = Ward.Create(command.ProvinceId, command.Name, command.IsCommune);
        await _repository.AddWardAsync(ward, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AdminWardDto(
            ward.Id,
            ward.ProvinceId,
            province.Name,
            ward.Name,
            ward.Status.ToString().ToUpperInvariant(),
            ward.IsCommune);
    }
}

