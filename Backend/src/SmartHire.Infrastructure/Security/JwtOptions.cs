using System.ComponentModel.DataAnnotations;
using SmartHire.Infrastructure.Security.Validation;

namespace SmartHire.Infrastructure.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required]
    public string Issuer { get; set; } = string.Empty;

    [Required]
    public string Audience { get; set; } = string.Empty;

    [Required]
    [MinimumUtf8ByteLength(32)]
    public string SigningKey { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int AccessTokenLifetimeMinutes { get; set; } = 15;

    [Range(1, int.MaxValue)]
    public int RefreshTokenLifetimeDays { get; set; } = 30;
}
