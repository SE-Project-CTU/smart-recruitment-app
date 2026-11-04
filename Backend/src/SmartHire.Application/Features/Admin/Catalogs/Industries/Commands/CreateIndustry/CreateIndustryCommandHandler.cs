using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Admin.Catalogs.Industries.Commands.CreateIndustry;

public sealed class CreateIndustryCommandHandler
    : IRequestHandler<CreateIndustryCommand, AdminIndustryDto> {
    private readonly IIndustryCatalogRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateIndustryCommandHandler(
        IIndustryCatalogRepository repository,
        IUnitOfWork unitOfWork) {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminIndustryDto> Handle(
        CreateIndustryCommand request,
        CancellationToken cancellationToken) {
        var command = CreateIndustryCommandValidator.Validate(request);

        var group = await _repository.GetGroupByIdAsync(command.GroupId, cancellationToken);
        if (group is null) {
            throw AdminExceptions.IndustryGroupNotFound(command.GroupId);
        }

        var exists = await _repository.IndustryNameExistsAsync(command.Name, null, cancellationToken);
        if (exists) {
            throw AdminExceptions.Conflict(
                AdminErrorCodes.IndustryNameAlreadyExists,
                $"Industry name '{command.Name}' already exists.",
                "name");
        }

        var industry = Industry.Create(command.GroupId, command.Name);
        await _repository.AddIndustryAsync(industry, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AdminIndustryDto(industry.Id, industry.GroupId, group.Name, industry.Name, industry.IsActive);
    }
}

