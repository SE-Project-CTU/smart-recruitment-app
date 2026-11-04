using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.IndustryGroups.Commands.UpdateIndustryGroup;

public sealed class UpdateIndustryGroupCommandHandler
    : IRequestHandler<UpdateIndustryGroupCommand, AdminIndustryGroupDto> {
    private readonly IIndustryCatalogRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateIndustryGroupCommandHandler(
        IIndustryCatalogRepository repository,
        IUnitOfWork unitOfWork) {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminIndustryGroupDto> Handle(
        UpdateIndustryGroupCommand request,
        CancellationToken cancellationToken) {
        var command = UpdateIndustryGroupCommandValidator.Validate(request);

        var group = await _repository.GetGroupByIdAsync(command.Id, cancellationToken);
        if (group is null) {
            throw AdminExceptions.IndustryGroupNotFound(command.Id);
        }

        if (command.Name is not null && !string.Equals(command.Name, group.Name, StringComparison.OrdinalIgnoreCase)) {
            var exists = await _repository.GroupNameExistsAsync(command.Name, command.Id, cancellationToken);
            if (exists) {
                throw AdminExceptions.Conflict(
                    AdminErrorCodes.IndustryGroupNameAlreadyExists,
                    $"Industry group name '{command.Name}' already exists.",
                    "name");
            }
        }

        // Soft Hide logic: when IsActive is set to false, it is safely toggled without deleting data
        group.Update(command.Name ?? group.Name, command.IsActive);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var count = await _repository.HasLinkedIndustriesAsync(group.Id, cancellationToken) ? 1 : 0;
        return new AdminIndustryGroupDto(group.Id, group.Name, group.IsActive, count);
    }
}

