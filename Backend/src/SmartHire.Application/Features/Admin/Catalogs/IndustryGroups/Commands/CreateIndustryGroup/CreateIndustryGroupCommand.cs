using MediatR;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.IndustryGroups.Commands.CreateIndustryGroup;

public sealed record CreateIndustryGroupCommand(
    string Name
) : IRequest<AdminIndustryGroupDto>;

