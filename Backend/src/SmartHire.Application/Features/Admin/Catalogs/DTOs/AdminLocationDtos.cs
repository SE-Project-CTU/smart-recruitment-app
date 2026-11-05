namespace SmartHire.Application.Features.Admin.Catalogs.DTOs;

public sealed record AdminProvinceDto(
    Guid Id,
    string Name,
    string Status,
    bool IsCentrallyGoverned,
    int WardsCount
);

public sealed record AdminWardDto(
    Guid Id,
    Guid ProvinceId,
    string ProvinceName,
    string Name,
    string Status,
    bool IsCommune
);

