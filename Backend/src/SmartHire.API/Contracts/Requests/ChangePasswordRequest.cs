using System.Text.Json.Serialization;

namespace SmartHire.Api.Contracts.Requests;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class ChangePasswordRequest
{
    public string? CurrentPassword { get; init; }
    public string? NewPassword { get; init; }
    public bool RevokeAllSessions { get; init; } = true;
}
