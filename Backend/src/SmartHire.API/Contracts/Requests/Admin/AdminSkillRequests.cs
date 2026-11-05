namespace SmartHire.Api.Contracts.Requests.Admin;

public sealed record CreateSkillRequest(string Name);

public sealed record UpdateSkillRequest(string? Name = null, bool? IsActive = null);

