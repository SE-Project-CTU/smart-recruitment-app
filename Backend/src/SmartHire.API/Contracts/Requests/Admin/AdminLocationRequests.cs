namespace SmartHire.Api.Contracts.Requests.Admin;

public sealed record CreateProvinceRequest(string Name, bool IsCentrallyGoverned = false);

public sealed record UpdateProvinceRequest(string? Name = null, bool? IsCentrallyGoverned = null, string? Status = null);

public sealed record CreateWardRequest(Guid ProvinceId, string Name, bool IsCommune = false);

public sealed record UpdateWardRequest(Guid? ProvinceId = null, string? Name = null, bool? IsCommune = null, string? Status = null);

