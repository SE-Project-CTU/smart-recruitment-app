namespace SmartHire.Application.Features.Admin.Catalogs.DTOs;

public sealed record AdminIndustryGroupDto(
    Guid Id,
    string Name,
    bool IsActive,
    int IndustriesCount
);

public sealed record AdminIndustryDto(
    Guid Id,
    Guid GroupId,
    string GroupName,
    string Name,
    bool IsActive
);

