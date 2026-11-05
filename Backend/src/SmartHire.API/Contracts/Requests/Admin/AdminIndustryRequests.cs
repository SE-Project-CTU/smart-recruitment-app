namespace SmartHire.Api.Contracts.Requests.Admin;

public sealed record CreateIndustryGroupRequest(string Name);

public sealed record UpdateIndustryGroupRequest(string? Name = null, bool? IsActive = null);

public sealed record CreateIndustryRequest(Guid GroupId, string Name);

public sealed record UpdateIndustryRequest(Guid? GroupId = null, string? Name = null, bool? IsActive = null);

