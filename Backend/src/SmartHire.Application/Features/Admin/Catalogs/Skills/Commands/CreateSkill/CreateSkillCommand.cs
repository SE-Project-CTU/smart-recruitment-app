using MediatR;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.Skills.Commands.CreateSkill;

public sealed record CreateSkillCommand(
    string Name
) : IRequest<AdminSkillDto>;

