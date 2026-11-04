using MediatR;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.IndustryGroups.Commands.UpdateIndustryGroup;

public sealed record UpdateIndustryGroupCommand(
    Guid Id,
    string? Name = null,
    bool? IsActive = null
) : IRequest<AdminIndustryGroupDto>;

