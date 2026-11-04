using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.Skills.Commands.UpdateSkill;

public sealed class UpdateSkillCommandHandler
    : IRequestHandler<UpdateSkillCommand, AdminSkillDto> {
    private readonly ISkillCatalogRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateSkillCommandHandler(
        ISkillCatalogRepository repository,
        IUnitOfWork unitOfWork) {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminSkillDto> Handle(
        UpdateSkillCommand request,
        CancellationToken cancellationToken) {
        var command = UpdateSkillCommandValidator.Validate(request);

        var skill = await _repository.GetSkillByIdAsync(command.Id, cancellationToken);
        if (skill is null) {
            throw AdminExceptions.SkillNotFound(command.Id);
        }

        if (command.Name is not null && !string.Equals(command.Name, skill.Name, StringComparison.OrdinalIgnoreCase)) {
            var exists = await _repository.SkillNameExistsAsync(command.Name, command.Id, cancellationToken);
            if (exists) {
                throw AdminExceptions.Conflict(
                    AdminErrorCodes.SkillNameAlreadyExists,
                    $"Skill name '{command.Name}' already exists.",
                    "name");
            }
        }

        // Soft Hide logic: when IsActive is set to false, it is safely toggled without deleting data
        skill.Update(command.Name, command.IsActive);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AdminSkillDto(skill.Id, skill.Name, skill.IsActive, skill.CreatedAt);
    }
}

