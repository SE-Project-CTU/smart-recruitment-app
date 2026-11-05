using MediatR;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.Catalogs.Provinces.Commands.UpdateProvince;

public sealed record UpdateProvinceCommand(
    Guid Id,
    string? Name = null,
    bool? IsCentrallyGoverned = null,
    LocationStatus? Status = null
) : IRequest<AdminProvinceDto>;

