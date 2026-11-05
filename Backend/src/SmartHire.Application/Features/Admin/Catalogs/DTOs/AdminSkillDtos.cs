namespace SmartHire.Application.Features.Admin.Catalogs.DTOs;

public sealed record AdminSkillDto(
    Guid Id,
    string Name,
    bool IsActive,
    DateTimeOffset CreatedAt
);

