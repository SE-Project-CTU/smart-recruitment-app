using MediatR;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.Catalogs.Wards.Commands.UpdateWard;

public sealed record UpdateWardCommand(
    Guid Id,
    Guid? ProvinceId = null,
    string? Name = null,
    bool? IsCommune = null,
    LocationStatus? Status = null
) : IRequest<AdminWardDto>;

