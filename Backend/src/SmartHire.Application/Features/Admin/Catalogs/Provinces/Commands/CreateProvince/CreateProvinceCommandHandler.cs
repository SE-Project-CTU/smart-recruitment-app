using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Admin.Catalogs.Provinces.Commands.CreateProvince;

public sealed class CreateProvinceCommandHandler
    : IRequestHandler<CreateProvinceCommand, AdminProvinceDto> {
    private readonly ILocationCatalogRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateProvinceCommandHandler(
        ILocationCatalogRepository repository,
        IUnitOfWork unitOfWork) {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminProvinceDto> Handle(
        CreateProvinceCommand request,
        CancellationToken cancellationToken) {
        var command = CreateProvinceCommandValidator.Validate(request);

        var exists = await _repository.ProvinceNameExistsAsync(command.Name, null, cancellationToken);
        if (exists) {
            throw AdminExceptions.Conflict(
                AdminErrorCodes.ProvinceNameAlreadyExists,
                $"Province name '{command.Name}' already exists.",
                "name");
        }

        var province = Province.Create(command.Name, command.IsCentrallyGoverned);
        await _repository.AddProvinceAsync(province, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AdminProvinceDto(
            province.Id,
            province.Name,
            province.Status.ToString().ToUpperInvariant(),
            province.IsCentrallyGoverned,
            0);
    }
}

