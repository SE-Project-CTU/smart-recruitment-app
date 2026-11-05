using MediatR;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.Skills.Commands.UpdateSkill;

public sealed record UpdateSkillCommand(
    Guid Id,
    string? Name = null,
    bool? IsActive = null
) : IRequest<AdminSkillDto>;

