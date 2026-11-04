using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Admin.Catalogs.Skills.Commands.CreateSkill;

public sealed class CreateSkillCommandHandler
    : IRequestHandler<CreateSkillCommand, AdminSkillDto> {
    private readonly ISkillCatalogRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateSkillCommandHandler(
        ISkillCatalogRepository repository,
        IUnitOfWork unitOfWork) {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminSkillDto> Handle(
        CreateSkillCommand request,
        CancellationToken cancellationToken) {
        var command = CreateSkillCommandValidator.Validate(request);

        var exists = await _repository.SkillNameExistsAsync(command.Name, null, cancellationToken);
        if (exists) {
            throw AdminExceptions.Conflict(
                AdminErrorCodes.SkillNameAlreadyExists,
                $"Skill name '{command.Name}' already exists.",
                "name");
        }

        var now = DateTimeOffset.UtcNow;
        var skill = Skill.Create(command.Name, now);
        await _repository.AddSkillAsync(skill, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AdminSkillDto(skill.Id, skill.Name, skill.IsActive, skill.CreatedAt);
    }
}

