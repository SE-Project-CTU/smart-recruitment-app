using System.Text.Json.Serialization;

namespace SmartHire.Api.Contracts.Requests;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class ChangePasswordRequest
{
    [Required(ErrorMessage = "Current password is required.")]
    public string? CurrentPassword { get; init; }
    
    [Required(ErrorMessage = "New password is required.")]
    [MinLength(8, ErrorMessage = "New password must contain at least 8 characters.")]
    public string? NewPassword { get; init; }
    public bool RevokeAllSessions { get; init; } = true;
}
