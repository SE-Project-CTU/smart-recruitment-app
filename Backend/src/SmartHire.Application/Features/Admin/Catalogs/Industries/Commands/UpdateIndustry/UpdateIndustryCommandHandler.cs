using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.Industries.Commands.UpdateIndustry;

public sealed class UpdateIndustryCommandHandler
    : IRequestHandler<UpdateIndustryCommand, AdminIndustryDto> {
    private readonly IIndustryCatalogRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateIndustryCommandHandler(
        IIndustryCatalogRepository repository,
        IUnitOfWork unitOfWork) {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminIndustryDto> Handle(
        UpdateIndustryCommand request,
        CancellationToken cancellationToken) {
        var command = UpdateIndustryCommandValidator.Validate(request);

        var industry = await _repository.GetIndustryByIdAsync(command.Id, cancellationToken);
        if (industry is null) {
            throw AdminExceptions.IndustryNotFound(command.Id);
        }

        if (command.GroupId.HasValue && command.GroupId.Value != industry.GroupId) {
            var groupExists = await _repository.IndustryGroupExistsAsync(command.GroupId.Value, cancellationToken);
            if (!groupExists) {
                throw AdminExceptions.IndustryGroupNotFound(command.GroupId.Value);
            }
        }

        if (command.Name is not null && !string.Equals(command.Name, industry.Name, StringComparison.OrdinalIgnoreCase)) {
            var exists = await _repository.IndustryNameExistsAsync(command.Name, command.Id, cancellationToken);
            if (exists) {
                throw AdminExceptions.Conflict(
                    AdminErrorCodes.IndustryNameAlreadyExists,
                    $"Industry name '{command.Name}' already exists.",
                    "name");
            }
        }

        // Soft Hide logic: when IsActive is set to false, it is safely toggled without deleting data
        industry.Update(command.GroupId, command.Name, command.IsActive);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var group = await _repository.GetGroupByIdAsync(industry.GroupId, cancellationToken);
        var groupName = group?.Name ?? string.Empty;

        return new AdminIndustryDto(industry.Id, industry.GroupId, groupName, industry.Name, industry.IsActive);
    }
}

