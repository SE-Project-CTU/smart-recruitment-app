using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Admin.Catalogs.IndustryGroups.Commands.CreateIndustryGroup;

public sealed class CreateIndustryGroupCommandHandler
    : IRequestHandler<CreateIndustryGroupCommand, AdminIndustryGroupDto> {
    private readonly IIndustryCatalogRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateIndustryGroupCommandHandler(
        IIndustryCatalogRepository repository,
        IUnitOfWork unitOfWork) {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminIndustryGroupDto> Handle(
        CreateIndustryGroupCommand request,
        CancellationToken cancellationToken) {
        var command = CreateIndustryGroupCommandValidator.Validate(request);

        var exists = await _repository.GroupNameExistsAsync(command.Name, null, cancellationToken);
        if (exists) {
            throw AdminExceptions.Conflict(
                AdminErrorCodes.IndustryGroupNameAlreadyExists,
                $"Industry group name '{command.Name}' already exists.",
                "name");
        }

        var group = IndustryGroup.Create(command.Name);
        await _repository.AddGroupAsync(group, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AdminIndustryGroupDto(group.Id, group.Name, group.IsActive, 0);
    }
}

