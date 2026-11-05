using MediatR;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.Wards.Commands.CreateWard;

public sealed record CreateWardCommand(
    Guid ProvinceId,
    string Name,
    bool IsCommune = false
) : IRequest<AdminWardDto>;

